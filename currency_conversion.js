import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

const API_KEY = 'your_api_key_here'; //  Get from https://www.exchangerate-api.com/ or similar
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest`;

const rl = readline.createInterface({ input, output });

const convertCurrency = async (from, to, amount) => {
  const url = `${BASE_URL}/${from}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Invalid currency code or API error.");
    }

    const data = await response.json();
    const rate = data.conversion_rates[to];

    if (!rate) {
      throw new Error(`Conversion to currency '${to}' is not supported.`);
    }

    const convertedAmount = rate * amount;

    console.log(`\n Conversion Result:`);
    console.log(`${amount} ${from} = ${convertedAmount.toFixed(2)} ${to}\n`);

  } catch (error) {
    console.error("Error:", error.message);
  }
};

const from = await rl.question(" Enter the base currency (e.g., USD): ");
const to = await rl.question(" Enter the target currency (e.g., INR): ");
const amountStr = await rl.question(" Enter the amount to convert: ");

const amount = parseFloat(amountStr);

if (isNaN(amount) || amount <= 0) {
  console.log(" Please enter a valid positive number for the amount.");
} else {
  await convertCurrency(from.toUpperCase(), to.toUpperCase(), amount);
}

rl.close();
