import { Configuration, OpenAIApi } from 'openai';
import { createReadStream, createWriteStream } from 'fs';
import axios from 'axios';
import dotenv from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

class OpenAI {
  roles = {
    ASSISTANT: 'assistant',
    USER: 'user',
    SYSTEM: 'system',
  };

  constructor() {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openAi = new OpenAIApi(configuration);
  }

  async chat(messages) {
    try {
      const response = await this.openAi.createChatCompletion({
        model: process.env.OPENAI_MODEL,
        messages,
      });

      return response.data.choices[0].message;
    } catch (e) {
      console.log('Error while chat', e.message);
    }
  }

  async translate(messages) {
    try {
      const response = await this.openAi.createChatCompletion({
        model: process.env.OPENAI_MODEL,
        messages,
      });

      return response.data.choices[0].message;
    } catch (e) {
      console.log('Error while chat', e.message);
    }
  }

  async imageGeneration(description, fileName) {
    try {
      const imagePath = resolve(__dirname, '../images', `${fileName}.jpeg`);
      const response = await this.openAi.createImage({
        prompt: description,
        size: '1024x1024',
        n: 1,
      });
      const axiosResponse = await axios({
        method: 'get',
        url: response.data.data[0].url,
        responseType: 'stream',
      });

      return new Promise((resolve, reject) => {
        const stream = createWriteStream(imagePath);
        axiosResponse.data.pipe(stream);
        stream.on('finish', () => resolve({ path: response.data.data[0].url }));
        stream.on('error', (error) => reject(error.message));
      });
    } catch (e) {
      console.log('Error while imageGeneration', e.message);
    }
  }

  async transcription(filePath) {
    try {
      const stream = createReadStream(filePath);
      const response = await this.openAi.createTranscription(
        stream,
        'whisper-1'
      );
      return response.data.text;
    } catch (e) {
      console.log('Error while file transcription', e.message);
    }
  }
}

export const openai = new OpenAI();
