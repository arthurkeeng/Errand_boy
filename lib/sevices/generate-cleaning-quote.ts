export function generateQuoteFromInput(serviceType: string, userInput: string): string {
  if (serviceType === "cleaning") {
    // Parse bedrooms, bathrooms, cleaning type, extras from userInput
    // (You can use regex or NLP for simple extraction)
    // Then calculate price estimate and return a formatted string

    // This is a simplified example:
    const bedroomsMatch = userInput.match(/(\d+)\s*bedrooms?/i);
    const bathroomsMatch = userInput.match(/(\d+)\s*bathrooms?/i);
    const deepClean = /deep clean/i.test(userInput);
    const extras = [];
    if (/fridge/i.test(userInput)) extras.push("fridge");
    if (/oven/i.test(userInput)) extras.push("oven");
    if (/balcony/i.test(userInput)) extras.push("balcony");
    if (/laundry/i.test(userInput)) extras.push("laundry");

    const bedrooms = bedroomsMatch ? parseInt(bedroomsMatch[1], 10) : 0;
    const bathrooms = bathroomsMatch ? parseInt(bathroomsMatch[1], 10) : 0;

    // Pricing logic example
    let basePrice = bedrooms * 30 + bathrooms * 20;
    if (deepClean) basePrice += 100;
    basePrice += extras.length * 20;

    return `Based on what you shared, your personalized cleaning quote is approximately $${basePrice}.  
    This includes ${bedrooms} bedrooms, ${bathrooms} bathrooms, ${deepClean ? "a deep clean," : "a regular clean,"} and extras: ${extras.join(", ") || "none"}.`;
  }

  if (serviceType === "laundry") {
    // Parse kgs or bags and express delivery
    const kgsMatch = userInput.match(/(\d+)\s*kgs?/i);
    const bagsMatch = userInput.match(/(\d+)\s*bags?/i);
    const express = /express/i.test(userInput);

    const quantity = kgsMatch ? parseInt(kgsMatch[1], 10) : bagsMatch ? parseInt(bagsMatch[1], 10) : 0;

    let price = quantity * 5; // $5 per kg or bag
    if (express) price += 15;

    return `Your laundry quote is approximately $${price} for ${quantity} ${kgsMatch ? "kgs" : "bags"} of laundry${express ? " with express delivery" : ""}.`;
  }

  return "Sorry, I couldn't calculate a quote for that service.";
}
