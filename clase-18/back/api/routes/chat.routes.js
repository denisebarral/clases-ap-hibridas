import { Router } from "express";

const router = Router();

router.post("/api/chat", (req, res) => {
  console.log("Esta llegando la resp", req.body.pregunta);
  fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization:
        "Bearer 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",
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      model: "qwen/qwen3-coder-480b-a35b-instruct",
      messages: [
        {
          role: "user",
          content: req.body.pregunta,
        },
      ],
      temperature: 0.6,
      top_p: 0.9,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 4096,
      stream: false,
    }),
  })
    .then((res) => res.json())
    .then((data) =>
      res.status(200).json({ message: data.choices[0].message.content })
    );
});

export default router;
