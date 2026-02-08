// PDF Export Utility using jsPDF
import jsPDF from "jspdf";
import "jspdf-autotable";

// Export Orders to PDF
export const exportOrdersToPDF = (orders, filters = {}) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.setTextColor(249, 115, 22); // Orange
  doc.text("FoodBuzz - Orders Report", 14, 20);

  // Metadata
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
  doc.text(`Total Orders: ${orders.length}`, 14, 34);

  if (filters.dateFrom || filters.dateTo) {
    doc.text(
      `Date Range: ${filters.dateFrom || "Start"} to ${filters.dateTo || "Now"}`,
      14,
      40,
    );
  }

  // Table data
  const tableData = orders.map((order, index) => [
    index + 1,
    order._id?.slice(-6) || "N/A",
    order.customerName || order.userId?.name || "N/A",
    `TK ${Number(order.total || 0).toFixed(2)}`,
    order.status || "N/A",
    order.paymentMethod || "COD",
    new Date(order.createdAt).toLocaleDateString(),
  ]);

  // Table
  doc.autoTable({
    startY: 45,
    head: [["#", "Order ID", "Customer", "Total", "Status", "Payment", "Date"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [249, 115, 22] }, // Orange
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 25 },
      2: { cellWidth: 40 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 },
      5: { cellWidth: 25 },
      6: { cellWidth: 30 },
    },
  });

  // Summary
  const finalY = doc.lastAutoTable.finalY + 10;
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const avgOrder = orders.length > 0 ? totalRevenue / orders.length : 0;

  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text(`Total Revenue: TK ${totalRevenue.toFixed(2)}`, 14, finalY);
  doc.text(`Average Order: TK ${avgOrder.toFixed(2)}`, 14, finalY + 7);

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" },
    );
  }

  // Save
  doc.save(`FoodBuzz_Orders_${new Date().toISOString().split("T")[0]}.pdf`);
};

// Export Users to PDF
export const exportUsersToPDF = (users) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.setTextColor(249, 115, 22);
  doc.text("FoodBuzz - Users Report", 14, 20);

  // Metadata
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
  doc.text(`Total Users: ${users.length}`, 14, 34);

  const activeUsers = users.filter((u) => u.isActive !== false).length;
  doc.text(`Active Users: ${activeUsers}`, 14, 40);

  // Table data
  const tableData = users.map((user, index) => [
    index + 1,
    user.name || "N/A",
    user.email || "N/A",
    user.role || "user",
    user.isActive !== false ? "Active" : "Inactive",
    new Date(user.createdAt).toLocaleDateString(),
  ]);

  // Table
  doc.autoTable({
    startY: 48,
    head: [["#", "Name", "Email", "Role", "Status", "Joined"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [249, 115, 22] },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 40 },
      2: { cellWidth: 60 },
      3: { cellWidth: 20 },
      4: { cellWidth: 25 },
      5: { cellWidth: 30 },
    },
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" },
    );
  }

  doc.save(`FoodBuzz_Users_${new Date().toISOString().split("T")[0]}.pdf`);
};

// Export Revenue Report to PDF
export const exportRevenueToPDF = (data) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.setTextColor(249, 115, 22);
  doc.text("FoodBuzz - Revenue Report", 14, 20);

  // Metadata
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

  // Summary boxes
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(
    `Total Revenue: TK ${Number(data.totalRevenue || 0).toFixed(2)}`,
    14,
    40,
  );
  doc.text(`Total Orders: ${data.totalOrders || 0}`, 14, 48);
  doc.text(
    `Average Order: TK ${Number(data.avgOrder || 0).toFixed(2)}`,
    14,
    56,
  );

  // Daily breakdown if available
  if (data.daily && data.daily.length > 0) {
    const tableData = data.daily.map((day) => [
      day.date,
      day.orders || 0,
      `TK ${Number(day.revenue || 0).toFixed(2)}`,
    ]);

    doc.autoTable({
      startY: 65,
      head: [["Date", "Orders", "Revenue"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [249, 115, 22] },
      styles: { fontSize: 10 },
    });
  }

  doc.save(`FoodBuzz_Revenue_${new Date().toISOString().split("T")[0]}.pdf`);
};

// Export Menu Items to PDF
export const exportMenuItemsToPDF = (items) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setTextColor(249, 115, 22);
  doc.text("FoodBuzz - Menu Items", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
  doc.text(`Total Items: ${items.length}`, 14, 34);

  const tableData = items.map((item, index) => [
    index + 1,
    item.name || "N/A",
    item.category || "N/A",
    `TK ${Number(item.price || 0).toFixed(2)}`,
    `${item.calories || 0} kcal`,
    item.isAvailable !== false ? "Yes" : "No",
  ]);

  doc.autoTable({
    startY: 42,
    head: [["#", "Name", "Category", "Price", "Calories", "Available"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [249, 115, 22] },
    styles: { fontSize: 9 },
  });

  doc.save(`FoodBuzz_MenuItems_${new Date().toISOString().split("T")[0]}.pdf`);
};

// Export Recipes to PDF
export const exportRecipesToPDF = (recipes) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setTextColor(249, 115, 22);
  doc.text("FoodBuzz - Recipes", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
  doc.text(`Total Recipes: ${recipes.length}`, 14, 34);

  const tableData = recipes.map((recipe, index) => [
    index + 1,
    recipe.name || "N/A",
    recipe.category || "N/A",
    `${recipe.prepTime || 0} + ${recipe.cookingTime || 0} min`,
    `${recipe.servings || 0}`,
    `${recipe.calories || 0} kcal`,
  ]);

  doc.autoTable({
    startY: 42,
    head: [["#", "Name", "Category", "Time", "Servings", "Calories"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [249, 115, 22] },
    styles: { fontSize: 9 },
  });

  doc.save(`FoodBuzz_Recipes_${new Date().toISOString().split("T")[0]}.pdf`);
};
