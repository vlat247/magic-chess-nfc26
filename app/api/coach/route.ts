import { NextRequest, NextResponse } from "next/server"

// API configuration
const PROXY_API_URL = "https://ai.hackclub.com/proxy/v1/chat/completions"

export async function POST(req: NextRequest) {
  try {
    const { moves, acpl, accuracy, counts } = await req.json()

    // 1. Identify critical moments to explain (Blunders, Mistakes, Missed Wins)
    // Filter moves where quality is blunder, mistake, or missed_win
    // Also include inaccuracies if there aren't many severe errors, up to a maximum of 4 critical moves to avoid overloading LLM.
    const criticalMoveTypes = ["blunder", "mistake", "missed_win"]
    let criticalMoves = moves.filter((m: any) => criticalMoveTypes.includes(m.quality))
    
    if (criticalMoves.length === 0) {
      // Fallback: explain inaccuracies if there are no major mistakes
      criticalMoves = moves.filter((m: any) => m.quality === "inaccuracy")
    }

    // Sort by largest centipawn loss first, and take the top 4
    criticalMoves = criticalMoves
      .sort((a: any, b: any) => b.centipawnLoss - a.centipawnLoss)
      .slice(0, 4)
      // Sort back by move index chronologically
      .sort((a: any, b: any) => a.moveIndex - b.moveIndex)

    // 2. Build details of moves for the prompt
    const moveDescriptions = criticalMoves.map((m: any) => {
      const turnLabel = m.moveIndex % 2 === 0 ? "White" : "Black";
      const moveNum = Math.floor(m.moveIndex / 2) + 1;
      return {
        moveIndex: m.moveIndex,
        moveNumber: moveNum,
        turn: turnLabel,
        playedMove: m.san,
        quality: m.quality,
        centipawnLoss: m.centipawnLoss,
        bestMoveSan: m.bestMove?.san || `${m.bestMove?.from} to ${m.bestMove?.to}`,
        explanationContext: `In this position, ${turnLabel} played ${m.san} (evaluated as a ${m.quality} costing ${m.centipawnLoss} centipawns). Stockfish's suggested best move was ${m.bestMove?.san || m.bestMove?.to}.`
      }
    })

    // 3. Create systemic prompts with "Archmage" persona
    const systemPrompt = `You are the "Archmage of the Chess Grid", an ancient and wise magical chess mentor. 
You analyze chess strategy, tactical mistakes, and magical fissures with a premium, retro dark-fantasy/arcane flair, while keeping the actual chess advice extremely accurate, direct, and educational.

Use atmospheric vocabulary:
- "White / Black player" -> "Light Magician / Dark Magician"
- "King" -> "The Monarch" or "King"
- "Rook" -> "The Rook Citadel" or "Castle Tower"
- "Knight" -> "The Arcane Steed" or "Lancer"
- "Bishop" -> "The High Priest" or "Bishop Cleric"
- "Pawn" -> "Pawn Zealot" or "Sentry"
- "Center control/Board" -> "Ley Lines of the Chess Grid"
- "Blunder" -> "A catastrophic magical fissure (Blunder)"
- "Mistake" -> "A volatile misstep in casting (Mistake)"
- "Missed Win" -> "A vanished opportunity for checkmate/glory (Missed Win)"

You MUST return a JSON object exactly conforming to this structure:
{
  "summary": "Provide a 3-4 sentence, highly engaging yet simple and easy-to-digest narrative summarizing the match in your Archmage persona. You MUST explicitly and clearly detail who dominated the battlefield (who commanded the upper hand, held center control, and dictated the flow of the match). Briefly mention the accuracy percentages, the key opening clash, and the decisive mistake that sealed the outcome.",
  "comments": [
    {
      "moveIndex": number, // MUST match the exact integer 'moveIndex' value of the analyzed move provided in the prompt details. Do NOT make up new indices or use array indexes.
      "comment": "A 1-2 sentence tactical analysis. Be specific! Explain *why* the played move failed (e.g. hung a piece, exposed the Monarch to check, lost control of the Ley Lines) and *why* the suggested best move was superior. Avoid generic remarks like 'this move was bad'."
    }
  ]
}

Ensure your response is valid, parsable JSON. Do not include markdown code block syntax (like \`\`\`json) in the raw response, only output the JSON object itself.\``

    const userPrompt = `
Analyze this completed chess match:
- Game Stats:
  * Light Magician (White): Accuracy: ${accuracy.white}%, ACPL: ${acpl.white}
  * Dark Magician (Black): Accuracy: ${accuracy.black}%, ACPL: ${acpl.black}
  * Blunders: White: ${counts.white.blunder}, Black: ${counts.black.blunder}
  * Mistakes: White: ${counts.white.mistake}, Black: ${counts.black.mistake}
  * Missed Wins: White: ${counts.white.missed_win}, Black: ${counts.black.missed_win}

- Critical Moments to explain:
${JSON.stringify(moveDescriptions, null, 2)}

Provide the structured JSON analysis now.`

    const apiKey = process.env.AI_COACH_API_KEY

    if (!apiKey) {
      throw new Error("AI_COACH_API_KEY environment variable is not configured.")
    }

    // Call the Hack Club proxy API
    const response = await fetch(PROXY_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "qwen/qwen3-32b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" } // Qwen 32B supports JSON mode
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("API error from proxy:", errorText)
      throw new Error(`Proxy API returned status ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    let rawContent = data.choices[0].message.content.trim()

    // Clean markdown code blocks if the model ignored instructions and wrapped it
    if (rawContent.startsWith("```")) {
      rawContent = rawContent.replace(/^```json\s*/i, "").replace(/```$/, "").trim()
    }

    const coachAnalysis = JSON.parse(rawContent)

    // Map comments back to their correct indices
    const commentsMap: Record<number, string> = {}
    if (Array.isArray(coachAnalysis.comments)) {
      coachAnalysis.comments.forEach((c: any, index: number) => {
        const matchedMove = criticalMoves[index];
        const isActualCriticalMoveIdx = criticalMoves.some((m: any) => m.moveIndex === c.moveIndex);
        const moveIdx = isActualCriticalMoveIdx
          ? c.moveIndex 
          : (matchedMove ? matchedMove.moveIndex : null);
        
        if (moveIdx !== null) {
          commentsMap[moveIdx] = c.comment
        }
      })
    }

    return NextResponse.json({
      summary: coachAnalysis.summary || "The grid stands silent. Both magicians fought with high focus, but minor errors decided the magical battle.",
      commentsMap
    })

  } catch (error: any) {
    console.error("AI Coach API error:", error)
    return NextResponse.json({ 
      error: "Failed to generate coaching commentary", 
      details: error.message 
    }, { status: 500 })
  }
}
