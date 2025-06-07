export const searchServices = async (query: string) => {
  const lowerQuery = query.toLowerCase();

  // Available services
  const services = [
    {
      name: "Home Cleaning",
      type: "cleaning",
      description:
        "Thorough cleaning of your home, including bedrooms, bathrooms, kitchen, and common areas. We offer regular and deep cleaning options.",
      details: `
🧼 **How Home Cleaning Works:**

1. **Book Online or Chat**: Tell us how many rooms and what kind of cleaning you want (regular or deep clean).
2. **Get a Quote**: Based on your home's size and your preferences.
3. **Scheduled Visit**: Our trained team arrives with all supplies.
4. **Cleaning in Action**: We follow a checklist tailored to your home.
5. **You're Done**: Review and relax in your freshly cleaned home.

💰 **Pricing Model**:
- Standard: $25–$50/hour
- Deep Clean: $200–$400 depending on size
- Add-ons: Fridge, oven, balcony, laundry (extra)

✅ Satisfaction guaranteed!
      `.trim(),
    },
    {
      name: "Laundry Pickup",
      type: "laundry",
      description:
        "Fast and convenient laundry service. We pick up, wash, fold, and deliver your clothes fresh and clean.",
      details: `
🧺 **How Laundry Pickup Works:**

1. **Schedule a Pickup**: Let us know when and where.
2. **We Collect**: Our runner picks up your laundry.
3. **We Wash & Fold**: Professional cleaning using premium detergents.
4. **We Deliver**: Get your clothes back fresh and folded within 24–48 hours.

💰 **Pricing**:
- Per kg or per bag
- Express options available

Great for busy professionals or families!
      `.trim(),
    },
  ];

  // Matching logic
  const matched = services.filter(
    (service) =>
      lowerQuery.includes(service.type) ||
      lowerQuery.includes(service.name.toLowerCase())
  );

  // AI-style response generation
  let aiResponse: string;
  if (matched.length > 0) {
    const first = matched[0];
    aiResponse = `🔍 You asked about ${first.name}. Here’s what we offer:\n\n${first.details}`;
  } else {
    aiResponse = `Sorry, I couldn't find a matching service for "${query}". Please try asking about cleaning or laundry.`;
  }

  return {
    services: matched,
    aiResponse,
  };
};
