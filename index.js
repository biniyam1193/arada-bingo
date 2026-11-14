const { Telegraf } = require('telegraf');

// የሰጡትን የቦት ቱክከን በቀጥታ አስገብቻለሁ
const bot = new Telegraf('8507897804:AAEup4FnA02AhOpeaoLxXYE3-LOFhXnKMKg');

// 1. ተጠቃሚው /start ሲል ስልክ ቁጥር እንዲያጋራ የሚጠይቅ ቁልፍ መላክ
bot.start((ctx) => {
  return ctx.reply(
    'ሰላም ወደ Smart Bingo ደህና መጡ! ለመጀመር እባክዎ ስልክ ቁጥርዎን ያጋሩ።',
    {
      reply_markup: {
        keyboard: [
          [{ text: '📱 ስልክ ቁጥር አጋራ (Share Contact)', request_contact: true }]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    }
  );
});

// 2. ተጠቃሚው ቁጥሩን ሲልክ መቀበል እና ማከማቸት
bot.on('contact', async (ctx) => {
  const contact = ctx.message.contact;
  const phoneNumber = contact.phone_number; // የተጠቃሚው ስልክ ቁጥር
  const telegramId = ctx.from.id;         // የቴሌግራም ID
  const firstName = ctx.from.first_name;     // ስም

  console.log(`ተጠቃሚ: ${firstName}, ID: ${telegramId}, ስልክ: ${phoneNumber}`);

  await ctx.reply(
    `መረጃዎ በተሳካ ሁኔታ ተመዝግቧል! አሁን ጨዋታውን ለመጀመር /play የሚለውን ይጠቀሙ።`,
    {
      reply_markup: {
        remove_keyboard: true // ቁጥሩ ከተላከ በኋላ የቁልፍ ሰሌዳውን ማጥፋት
      }
    }
  );
});

// ቦቱን ማስጀመር
bot.launch();
console.log('ቦቱ በመስራት ላይ ነው...');
