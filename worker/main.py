from worker.llm.job_ad.extractor import JobAdExtractor

if __name__ == "__main__":
  JOB_AD_TEXT = """About Karbon
Karbon is the global leader in AI-powered practice management software for accounting firms. We provide an award-winning cloud platform that helps tens of thousands of accounting professionals work more efficiently and collaboratively every day. With customers in 40 countries, we have grown into a globally distributed team across the US, Australia, New Zealand, Canada, the United Kingdom, and the Philippines. We are well-funded, ranked #1 on G2, growing rapidly, and have a people-first culture that is recognized with Great Place To Work® certification and on Fortune magazine's Best Small Workplaces™ List.
We’re hiring a Junior Frontend Engineer to join our Front End Developer Experience (FEDx) team in Sydney. You’ll help migrate parts of our product to React and improve the day-to-day experience of building and shipping front end at Karbon.
This is a great role for someone hungry to learn, keen to take ownership, and excited to make an impact early.
About the Role!
•	Build new React UI and help migrate existing screens and components to React.
•	Work with Next.js patterns where it makes sense (routing, layouts, data fetching approaches, page performance).
•	Build consistent UI and learn how we maintain a shared design system.
•	Use AI tools to move faster (for example: drafting code, exploring options, writing tests), while applying good judgement and always reviewing what ships.
•	Work closely with senior engineers to break work down, ship iteratively, and learn good engineering habits.
•	Improve front end developer experience through small tooling, testing, and workflow improvements.
•	Write clear, maintainable code and learn how we think about quality, performance, and accessibility.
•	Contribute to team discussions, ask questions early, and share what you learn.
•	Use AI tools thoughtfully - Leverage AI to move faster for example drafting code, exploring solutions, or writing tests, while applying good judgement and always reviewing what ships.
Our Techstack
•	Frontend: React, TypeScript, and Ember (during the migration). Next.js, TanStack Query, Tailwind, shadcn (where applicable)
•	Backend: .NET (C#, .NET Core, Web API) with SQL Server
About You!
We know great engineers come from many backgrounds. You don’t need to tick every box below to apply.
•	You’ve built something in React (personal projects, study, internships, or commercial experience).
•	Curiosity and a strong learning mindset. You enjoy feedback and want to get better fast.
•	A bias toward action. You like shipping, iterating, and finishing what you start.
•	Clear communication. You can explain what you’re doing, what’s blocked, and what you need.
•	Care for the craft: readable code, small pull requests, and pride in quality.
Bonus if you have:
•	Next.js experience (even at a basic level).
•	TypeScript experience.
•	Experience with Tailwind or component libraries.
•	Exposure to automated testing (unit, integration, or end-to-end).
•	Experience working in a product team with designers and product managers.
•	Any experience with migrations, refactors, or improving existing code.
Why Work at Karbon?
•	Gain global experience across the USA, Australia, New Zealand, UK, Canada and the Philippines
•	4 weeks annual leave plus 5 extra "Karbon Days" off a year
•	Flexible working environment
•	Work with (and learn from) an experienced, high-performing team
•	Be part of a fast-growing company that firmly believes in promoting high performers from within
•	A collaborative, team-oriented culture that embraces diversity, invests in development, and provides consistent feedback
•	Generous parental leave
 
Karbon embraces diversity and inclusion, aligning with our values as a business. Research has shown that women and underrepresented groups are less likely to apply to jobs unless they meet every single criteria. If you've made it this far in the job description but your past experience doesn't perfectly align, we do encourage you to still apply. You could still be the right person for the role!
We recruit and reward people based on capability and performance. We don’t discriminate based on race, gender, sexual orientation, gender identity or expression, lifestyle, age, educational background, national origin, religion, physical or cognitive ability, and other diversity dimensions that may hinder inclusion in the organization.
Generally, if you are a good person, we want to talk to you. 😛
If there are any adjustments or accommodations that we can make to assist you during the recruitment process, and your journey at Karbon, contact us at people.support@karbonhq.com for a confidential discussion."""
  
  extractor = JobAdExtractor()

  json_response = extractor.extract(job_ad_text=JOB_AD_TEXT)

  print(json_response)


