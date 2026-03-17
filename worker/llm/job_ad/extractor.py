from ollama import Client

class JobAdExtractor:
    def __init__ (self, model_name: str = "qwen3.5:397b-cloud", options: dict = { "temperature": 0, "repeat_penalty":1.2, "seed":42}):
        
        self.client = Client(
            host="https://ollama.com",
            headers={'Authorization': 'Bearer ' + '3c6f824ed886478283aeba63f304f263.N-AYUv78Xzy3-EqfBK4PJ2tO'})

        self.__system_prompt = {
            'role': 'system',
            'content': """You are a professional job ad analysis engine.

Your task is to extract structured information from a job advertisement.

Extraction scope:
- START from the first role-related section (e.g. role description, responsibilities, requirements).
- INCLUDE responsibilities, requirements, skills, and qualifications.
- STOP before sections about benefits, perks, company culture, hiring process, contact details, or unrelated company information.

Rules:
- Extract only information explicitly present in the job ad.
- Do NOT infer, assume, or generate missing details.
- Do NOT include company description, benefits, culture, or promotional content.
- Preserve original wording as much as possible (only trim bullets and whitespace).
- Remove bullet symbols and normalise whitespace.
- Avoid duplicates within each field.
- Keep items concise, specific, and factual.
- If a field is missing, return null or an empty array.
- Exclude motivational or cultural language from all fields.

Field definitions:
- responsibilities = action-based tasks describing what the role does. Must be concrete actions (verbs). Keep as short statements.

- requirements = required experience, qualifications, or expectations. Include items mentioning experience, years, knowledge, or familiarity. Exclude soft personality traits unless explicitly required.

- tech_stack = specific tools, frameworks, programming languages, platforms, or technologies.
  - Each item must be a single canonical name (e.g. "React", "TypeScript", "PostgreSQL").
  - Split combined items into separate entries.
  - Do NOT include general skills.

- seniority = explicit level if mentioned (e.g. "Junior", "Mid", "Senior"), otherwise null.

Output:
- Return ONLY a single JSON object (no explanation, no extra text).
- Must strictly follow the expected schema.

Output schema:
{
  "responsibilities": string[],
  "requirements": string[],
  "seniority": string | null,
  "tech_stack": string[]
}

Validation:
- Do not hallucinate.
- Do not merge unrelated sections.
- Do not include duplicate items.
- Ensure valid JSON."""
          }
        
        self.__model_name = model_name
        self.__options = options
          
    def extract(self, job_ad_text: str) -> dict:
        messages = [
            self.__system_prompt,
            {
                'role': 'user',
                'content': job_ad_text
            }
        ]

        response = self.client.chat(model=self.__model_name, messages=messages, format="json", stream=False, options={**self.__options})
        return response['message']['content']  
    