// Excel Export Utility using xlsx
import * as XLSX from "xlsx";

// Export Orders to Excel
export const exportOrdersToExcel = (orders) => {
  // Prepare data
  const data = orders.map((order, index) => ({
    "#": index + 1,
    "Order ID": order._id || "N/A",
    "Customer Name": order.customerName || order.userId?.name || "N/A",
    "Customer Email": order.customerEmail || order.userId?.email || "N/A",
    Phone: order.phone || "N/A",
    Address: order.deliveryAddress || "N/A",
    Subtotal: Number(order.subtotal || 0).toFixed(2),
    "Delivery Fee": Number(order.deliveryFee || 0).toFixed(2),
    Total: Number(order.total || 0).toFixed(2),
    "Payment Method": order.paymentMethod || "COD",
    "Payment Status": order.paymentStatus || "pending",
    "Order Status": order.status || "Placed",
    "Items Count": order.items?.length || 0,
    "Created At": new Date(order.createdAt).toLocaleString(),
    "Updated At": new Date(order.updatedAt).toLocaleString(),
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths
  worksheet["!cols"] = [
    { wch: 5 }, // #
    { wch: 25 }, // Order ID
    { wch: 20 }, // Customer Name
    { wch: 25 }, // Customer Email
    { wch: 15 }, // Phone
    { wch: 30 }, // Address
    { wch: 12 }, // Subtotal
    { wch: 12 }, // Delivery Fee
    { wch: 12 }, // Total
    { wch: 15 }, // Payment Method
    { wch: 15 }, // Payment Status
    { wch: 15 }, // Order Status
    { wch: 12 }, // Items Count
    { wch: 20 }, // Created At
    { wch: 20 }, // Updated At
  ];

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

  // Add summary sheet
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const avgOrder = orders.length > 0 ? totalRevenue / orders.length : 0;

  const summaryData = [
    { Metric: "Total Orders", Value: orders.length },
    { Metric: "Total Revenue", Value: `TK ${totalRevenue.toFixed(2)}` },
    { Metric: "Average Order", Value: `TK ${avgOrder.toFixed(2)}` },
    { Metric: "Generated At", Value: new Date().toLocaleString() },
  ];

  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  summarySheet["!cols"] = [{ wch: 20 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  // Save file
  XLSX.writeFile(
    workbook,
    `FoodBuzz_Orders_${new Date().toISOString().split("T")[0]}.xlsx`,
  );
};

// Export Users to Excel
export const exportUsersToExcel = (users) => {
  const data = users.map((user, index) => ({
    "#": index + 1,
    "User ID": user._id || "N/A",
    Name: user.name || "N/A",
    Email: user.email || "N/A",
    Phone: user.phone || "N/A",
    Role: user.role || "user",
    Status: user.isActive !== false ? "Active" : "Inactive",
    "Email Verified": user.isEmailVerified ? "Yes" : "No",
    "Orders Count": user.ordersCount || 0,
    "Reviews Count": user.reviewsCount || 0,
    Joined: new Date(user.createdAt).toLocaleString(),
    "Last Updated": new Date(user.updatedAt).toLocaleString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet["!cols"] = [
    { wch: 5 }, // #
    { wch: 25 }, // User ID
    { wch: 20 }, // Name
    { wch: 25 }, // Email
    { wch: 15 }, // Phone
    { wch: 10 }, // Role
    { wch: 10 }, // Status
    { wch: 15 }, // Email Verified
    { wch: 12 }, // Orders Count
    { wch: 12 }, // Reviews Count
    { wch: 20 }, // Joined
    { wch: 20 }, // Last Updated
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

  // Summary
  const activeUsers = users.filter((u) => u.isActive !== false).length;
  const summaryData = [
    { Metric: "Total Users", Value: users.length },
    { Metric: "Active Users", Value: activeUsers },
    { Metric: "Inactive Users", Value: users.length - activeUsers },
    { Metric: "Generated At", Value: new Date().toLocaleString() },
  ];

  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  summarySheet["!cols"] = [{ wch: 20 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  XLSX.writeFile(
    workbook,
    `FoodBuzz_Users_${new Date().toISOString().split("T")[0]}.xlsx`,
  );
};

// Export Menu Items to Excel
export const exportMenuItemsToExcel = (items) => {
  const data = items.map((item, index) => ({
    "#": index + 1,
    "Item ID": item._id || "N/A",
    Name: item.name || "N/A",
    Category: item.category || "N/A",
    Price: Number(item.price || 0).toFixed(2),
    Calories: item.calories || 0,
    Details: item.details || "",
    Available: item.isAvailable !== false ? "Yes" : "No",
    Vegetarian: item.isVegetarian ? "Yes" : "No",
    Vegan: item.isVegan ? "Yes" : "No",
    "Gluten Free": item.isGlutenFree ? "Yes" : "No",
    Allergens: (item.allergens || []).join(", "),
    "Created At": new Date(item.createdAt).toLocaleString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet["!cols"] = [
    { wch: 5 }, // #
    { wch: 25 }, // Item ID
    { wch: 30 }, // Name
    { wch: 15 }, // Category
    { wch: 10 }, // Price
    { wch: 10 }, // Calories
    { wch: 40 }, // Details
    { wch: 10 }, // Available
    { wch: 12 }, // Vegetarian
    { wch: 10 }, // Vegan
    { wch: 12 }, // Gluten Free
    { wch: 30 }, // Allergens
    { wch: 20 }, // Created At
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Menu Items");

  XLSX.writeFile(
    workbook,
    `FoodBuzz_MenuItems_${new Date().toISOString().split("T")[0]}.xlsx`,
  );
};

// Export Recipes to Excel
export const exportRecipesToExcel = (recipes) => {
  const data = recipes.map((recipe, index) => ({
    "#": index + 1,
    "Recipe ID": recipe._id || "N/A",
    Name: recipe.name || "N/A",
    Category: recipe.category || "N/A",
    Description: recipe.description || "",
    "Prep Time (min)": recipe.prepTime || 0,
    "Cooking Time (min)": recipe.cookingTime || 0,
    "Total Time (min)": (recipe.prepTime || 0) + (recipe.cookingTime || 0),
    Servings: recipe.servings || 0,
    Calories: recipe.calories || 0,
    Difficulty: recipe.difficulty || "Medium",
    Vegetarian: recipe.isVegetarian ? "Yes" : "No",
    Vegan: recipe.isVegan ? "Yes" : "No",
    "Gluten Free": recipe.isGlutenFree ? "Yes" : "No",
    Allergens: (recipe.allergens || []).join(", "),
    Ingredients: (recipe.ingredients || []).join("; "),
    "Created At": new Date(recipe.createdAt).toLocaleString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet["!cols"] = [
    { wch: 5 }, // #
    { wch: 25 }, // Recipe ID
    { wch: 30 }, // Name
    { wch: 15 }, // Category
    { wch: 50 }, // Description
    { wch: 12 }, // Prep Time
    { wch: 15 }, // Cooking Time
    { wch: 15 }, // Total Time
    { wch: 10 }, // Servings
    { wch: 10 }, // Calories
    { wch: 12 }, // Difficulty
    { wch: 12 }, // Vegetarian
    { wch: 10 }, // Vegan
    { wch: 12 }, // Gluten Free
    { wch: 30 }, // Allergens
    { wch: 60 }, // Ingredients
    { wch: 20 }, // Created At
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Recipes");

  XLSX.writeFile(
    workbook,
    `FoodBuzz_Recipes_${new Date().toISOString().split("T")[0]}.xlsx`,
  );
};

// Export Revenue Report to Excel
export const exportRevenueToExcel = (data) => {
  // Main data
  const mainData = [
    {
      Metric: "Total Revenue",
      Value: `TK ${Number(data.totalRevenue || 0).toFixed(2)}`,
    },
    { Metric: "Total Orders", Value: data.totalOrders || 0 },
    {
      Metric: "Average Order Value",
      Value: `TK ${Number(data.avgOrder || 0).toFixed(2)}`,
    },
    { Metric: "Report Generated", Value: new Date().toLocaleString() },
  ];

  const mainSheet = XLSX.utils.json_to_sheet(mainData);
  mainSheet["!cols"] = [{ wch: 25 }, { wch: 30 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, mainSheet, "Summary");

  // Daily breakdown if available
  if (data.daily && data.daily.length > 0) {
    const dailyData = data.daily.map((day, index) => ({
      "#": index + 1,
      Date: day.date,
      Orders: day.orders || 0,
      Revenue: `TK ${Number(day.revenue || 0).toFixed(2)}`,
    }));

    const dailySheet = XLSX.utils.json_to_sheet(dailyData);
    dailySheet["!cols"] = [{ wch: 5 }, { wch: 15 }, { wch: 10 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, dailySheet, "Daily Breakdown");
  }

  XLSX.writeFile(
    workbook,
    `FoodBuzz_Revenue_${new Date().toISOString().split("T")[0]}.xlsx`,
  );
};
