import cron from 'node-cron';
import axios from 'axios';

cron.schedule('* * * * *', async () => {
  try {
    await axios.post(`${process.env.NEXTAUTH_URL}/api/scrape`);
  } catch (error) {
    console.error('Error scraping news:', error);
  }
});
