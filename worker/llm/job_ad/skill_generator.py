from ollama import Client

class JobAdSkillGenerator:
    def __init__ (self, model_name: str = "qwen3.5:397b-cloud", options: dict = { "temperature": 0.1, "repeat_penalty":1.2, "seed":42}):
        
        self.client = Client(
            host="https://ollama.com",
            headers={'Authorization': 'Bearer ' + '3c6f824ed886478283aeba63f304f263.N-AYUv78Xzy3-EqfBK4PJ2tO'})
        
        self.__model_name = model_name
        self.__options = options

        self.__system_prompt = {
            'role': 'system',
            'content': """You are a job skill summarisation engine.

Your task: derive EXACTLY top 6 high-level skills from a job advertisement.

Rules:
- Skills must be derived strictly from the responsibilities, requirements, and tech stack in the job ad.
- Return EXACTLY 6 skills.

- Each skill must represent a high-level capability area (not a single tool, product, or one-off task).
- Each skill must group only closely related technologies, tasks, or knowledge into one coherent concept.

- Prefer practical, noun-based capability categories (e.g. "Backend Development", "Testing", "Database Management", "AI Integration").
- Maintain a consistent abstraction level across all skills.

- Each skill name must be concise (2–5 words max).
- Avoid overly formal or inflated wording (e.g. avoid "Implementation", "Optimization", "Architecture Design" unless clearly and explicitly supported).
- Prefer simple, widely understood category names.
- Prefer noun-based skill names over verb phrases.

- Do NOT output low-level actions or task phrases (e.g. "writing code", "using React", "improving workflow").
- Do NOT include vague personal traits or soft qualities (e.g. "communication", "mindset", "good judgement").

- Only derive skills clearly supported by the job ad.
- Do NOT invent new domains or introduce concepts not grounded in the text.
- Do NOT over-generalise weak signals.

- Only group technologies that are directly related in the job ad context.
- Do NOT mix unrelated domains within a single skill.

- Avoid redundancy: skills must not overlap in meaning.
- Ensure each skill represents a distinct capability area.

- If fewer than 6 clear skills are present:
  - Derive remaining skills conservatively from repeated or strongly implied technical themes.
  - Do NOT introduce new domains or speculative concepts.

Format:
- Return EXACTLY 6 skills.
- Each skill must follow this format:

"<Skill name> (<optional details>)"

- The skill name should be clean and simple.
- The details in parentheses should include key technologies or concrete examples explicitly mentioned in the job ad.
- Keep details concise and relevant.
- Do NOT hallucinate tools or technologies.
- Omit parentheses if no meaningful details are available.

Output:
- Return a JSON array of 6 strings only.
- No explanation. No extra text."""
        }

    def generate_skills(self, extracted_data: dict) -> list[str]:
        messages = [
            self.__system_prompt,
            {
                'role': 'user',
                'content': extracted_data
            }
        ]

        response = self.client.chat(messages=messages, model=self.__model_name, format="json", stream=False, options=self.__options)
        return response['message']['content']