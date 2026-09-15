export default {
  async email(message, env, ctx) {
    try {
      const from = message.from;
      const to = message.to;
      const subject = message.headers.get('subject') || '(Tanpa Subjek)';

      const reader = message.raw.getReader();
      const decoder = new TextDecoder();
      let rawText = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        rawText += decoder.decode(value, { stream: true });
      }

      const previewText = rawText.substring(0, 3000);

      const botToken = env.TELEGRAM_BOT_TOKEN;
      const chatId = env.TELEGRAM_CHAT_ID;

      const payloadText = `📧 *EMAIL MASUK BARU*\n\n` +
                          `*Dari:* \`${from}\`\n` +
                          `*Ke:* \`${to}\`\n` +
                          `*Subjek:* ${subject}\n\n` +
                          `*Isi Pesan/OTP Mentah:*\n\`\`\`\n${previewText}\n\`\`\``;

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: payloadText,
          parse_mode: 'Markdown'
        })
      });
    } catch (err) {
      console.error('Gagal memproses email:', err);
    }
  }
};
