import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: 'sk-9qKY_D5cdoHMLqN7Z-V8G3WTbrhTlWIgdZXQdIhrg1T3BlbkFJiZIV_zjhEFh-GJFDwvHH-EtSZ8_TEF3CEiiDYY-bUA',
});

async function main() {
    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: "You are a helpful assistant." }],
            model: "gpt-3.5-turbo",
        });

        console.log(completion.choices[0]);
    } catch (error) {
        console.error("Error:", error);
    }
}

main();