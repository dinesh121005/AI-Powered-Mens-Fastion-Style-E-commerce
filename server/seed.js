require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected for seeding");
    seedDatabase();
  })
  .catch((error) => console.log("MongoDB connection error:", error));

const categories = [
  "men-shirts",
  "men-pants",
  "men-jackets",
  "men-shoes",
  "men-accessories",
];

const brands = ["nike", "adidas", "puma", "levi", "zara", "h&m"];

const shirtImages = [
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1523381210434-5a0760d9c0e0?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop",
];

const pantsImages = [
  "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1506629905607-0b5b8b5b5b5b?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&h=300&fit=crop",
];

const jacketsImages = [
  "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1523381210434-5a0760d9c0e0?w=300&h=300&fit=crop",
];

const shoesImages = [
  "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=300&h=300&fit=crop",
];

const accessoriesImages = [
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1523381210434-5a0760d9c0e0?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop",
];

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateProducts = (category, count) => {
  const products = [];
  for (let i = 0; i < count; i++) {
    const price = Math.floor(Math.random() * 180) + 20;
    const salePrice = Math.random() > 0.5 ? Math.floor(price * 0.8) : null;
    const totalStock = Math.floor(Math.random() * 90) + 10;
    const averageReview = Math.random() * 2 + 3;

    let sizes, fits, materials, titles, descriptions, imageBase, imageUrl;

    switch (category) {
      case "men-shirts":
        sizes = ["S", "M", "L", "XL"];
        fits = ["Slim", "Regular", "Loose"];
        materials = ["Cotton", "Polyester", "Linen"];
        titles = [
          "Classic White Shirt",
          "Striped Polo Shirt",
          "Casual Denim Shirt",
          "Formal Dress Shirt",
          "Graphic Tee",
          "Button-Down Shirt",
          "Henley Shirt",
          "Flannel Shirt",
          "Oxford Shirt",
          "V-Neck Tee",
        ];
        descriptions = [
          "A comfortable and stylish shirt perfect for everyday wear.",
          "Made from high-quality materials for durability and comfort.",
          "Versatile design that pairs well with any outfit.",
          "Breathable fabric ideal for all seasons.",
          "Classic fit with modern touches.",
        ];
        imageUrl = shirtImages[i % shirtImages.length];
        break;
      case "men-pants":
        sizes = ["28", "30", "32", "34", "36"];
        fits = ["Slim", "Regular", "Loose"];
        materials = ["Cotton", "Denim", "Polyester"];
        titles = [
          "Slim Fit Jeans",
          "Chinos Pants",
          "Cargo Pants",
          "Dress Pants",
          "Sweatpants",
          "Khaki Pants",
          "Jogger Pants",
          "Corduroy Pants",
          "Trousers",
          "Track Pants",
        ];
        descriptions = [
          "Comfortable pants designed for everyday use.",
          "Durable fabric that maintains shape over time.",
          "Versatile style suitable for casual and semi-formal occasions.",
          "Easy to care for and machine washable.",
          "Modern cut with excellent mobility.",
        ];
        imageUrl = pantsImages[i % pantsImages.length];
        break;
      case "men-jackets":
        sizes = ["S", "M", "L", "XL"];
        fits = ["Slim", "Regular", "Loose"];
        materials = ["Leather", "Nylon", "Cotton"];
        titles = [
          "Leather Jacket",
          "Bomber Jacket",
          "Denim Jacket",
          "Field Jacket",
          "Blazer",
          "Windbreaker",
          "Hooded Jacket",
          "Trench Coat",
          "Puffer Jacket",
          "Varsity Jacket",
        ];
        descriptions = [
          "Stylish jacket that adds edge to any outfit.",
          "Water-resistant material for all-weather protection.",
          "Classic design with timeless appeal.",
          "Comfortable lining for warmth and comfort.",
          "Versatile piece for layering.",
        ];
        imageUrl = jacketsImages[i % jacketsImages.length];
        break;
      case "men-shoes":
        sizes = ["7", "8", "9", "10", "11"];
        fits = ["Standard"];
        materials = ["Leather", "Synthetic", "Canvas"];
        titles = [
          "Running Sneakers",
          "Casual Loafers",
          "Dress Shoes",
          "Boots",
          "Sandals",
          "Basketball Shoes",
          "Hiking Boots",
          "Slip-On Shoes",
          "Oxfords",
          "High-Tops",
        ];
        descriptions = [
          "Comfortable shoes designed for performance and style.",
          "Durable construction built to last.",
          "Versatile footwear suitable for various occasions.",
          "Breathable materials for all-day comfort.",
          "Modern design with superior support.",
        ];
        imageUrl = shoesImages[i % shoesImages.length];
        break;
      case "men-accessories":
        sizes = null;
        fits = null;
        materials = ["Metal", "Leather", "Fabric"];
        titles = [
          "Leather Belt",
          "Wristwatch",
          "Sunglasses",
          "Wallet",
          "Tie",
          "Cufflinks",
          "Hat",
          "Scarf",
          "Backpack",
          "Jewelry Set",
        ];
        descriptions = [
          "Essential accessory to complete your look.",
          "High-quality craftsmanship for lasting durability.",
          "Versatile item that complements any style.",
          "Practical and stylish design.",
          "Timeless piece for everyday use.",
        ];
        imageUrl = accessoriesImages[i % accessoriesImages.length];
        break;
    }

    const product = {
      image: imageUrl,
      title: getRandomElement(titles),
      description: getRandomElement(descriptions),
      category,
      brand: getRandomElement(brands),
      price,
      salePrice,
      totalStock,
      averageReview: parseFloat(averageReview.toFixed(1)),
      size: sizes ? sizes : [],
      fit: fits ? getRandomElement(fits) : null,
      material: getRandomElement(materials),
    };

    products.push(product);
  }
  return products;
};

const seedDatabase = async () => {
  try {
    // Clear existing products
    await Product.deleteMany({});
    console.log("Existing products cleared");

    const allProducts = [];
    categories.forEach((category) => {
      const products = generateProducts(category, 10);
      allProducts.push(...products);
    });

    await Product.insertMany(allProducts);
    console.log(`Seeded ${allProducts.length} products successfully`);

    mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error seeding database:", error);
    mongoose.connection.close();
  }
};
