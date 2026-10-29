import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export const SAMPLE_CATALOG_DATA = [
  {
    'Product Title': 'Women Printed Rayon Straight Kurti (Mustard Yellow)',
    'SKU ID': 'KURTI-RAYON-YLW-001',
    'Style Code': 'STYLE-KURTI-101',
    'Brand Name': 'StyleCraft',
    'Category': 'Women Ethnic Wear',
    'Sub Category': 'Kurtis',
    'Fabric Material': 'Rayon',
    'Selling Price (INR)': 449,
    'MRP (INR)': 999,
    'Stock Qty': 100,
    'GST Rate (%)': 5,
    'HSN Code': '6204',
    'Package Weight (Grams)': 280,
    'Main Image URL': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
    'Description': 'Premium Rayon Kurti for festive wear.',
  },
  {
    'Product Title': 'Women Printed Rayon Straight Kurti (Maroon Red)',
    'SKU ID': 'KURTI-RAYON-MRN-002',
    'Style Code': 'STYLE-KURTI-101',
    'Brand Name': 'StyleCraft',
    'Category': 'Women Ethnic Wear',
    'Sub Category': 'Kurtis',
    'Fabric Material': 'Rayon',
    'Selling Price (INR)': 449,
    'MRP (INR)': 999,
    'Stock Qty': 80,
    'GST Rate (%)': 5,
    'HSN Code': '6204',
    'Package Weight (Grams)': 280,
    'Main Image URL': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
    'Description': 'Elegant maroon kurti with gold foil design.',
  },
  {
    // INTENTIONAL ERROR: Duplicate SKU
    'Product Title': 'Women Printed Rayon Straight Kurti (Maroon Red Duplicate)',
    'SKU ID': 'KURTI-RAYON-MRN-002',
    'Style Code': 'STYLE-KURTI-101',
    'Brand Name': 'StyleCraft',
    'Category': 'Women Ethnic Wear',
    'Sub Category': 'Kurtis',
    'Fabric Material': 'Rayon',
    'Selling Price (INR)': 449,
    'MRP (INR)': 999,
    'Stock Qty': 50,
    'GST Rate (%)': 5,
    'HSN Code': '6204',
    'Package Weight (Grams)': 280,
    'Main Image URL': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
    'Description': 'Duplicate SKU row test.',
  },
  {
    // INTENTIONAL ERROR: Selling price > MRP & Invalid HSN
    'Product Title': 'Cotton Anarkali Suit Set with Dupatta',
    'SKU ID': 'SUIT-ANKL-COT-003',
    'Style Code': 'STYLE-SUIT-201',
    'Brand Name': 'StyleCraft',
    'Category': 'Women Ethnic Wear',
    'Sub Category': 'Suits',
    'Fabric Material': 'Cotton',
    'Selling Price (INR)': 1299,
    'MRP (INR)': 899,
    'Stock Qty': 40,
    'GST Rate (%)': 5,
    'HSN Code': 'INVALID_HSN',
    'Package Weight (Grams)': 450,
    'Main Image URL': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
    'Description': 'Pure cotton Anarkali set with bandhani print dupatta.',
  },
  {
    'Product Title': 'Velvet Glass Bangles Chuda Set for Women',
    'SKU ID': 'JEWEL-BANGL-RED-24P',
    'Style Code': 'STYLE-JEWEL-301',
    'Brand Name': 'Listivo Craft',
    'Category': 'Jewelry & Accessories',
    'Sub Category': 'Bangles',
    'Fabric Material': 'Brass & Velvet',
    'Selling Price (INR)': 279,
    'MRP (INR)': 699,
    'Stock Qty': 150,
    'GST Rate (%)': 3,
    'HSN Code': '7117',
    'Package Weight (Grams)': 150,
    'Main Image URL': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80',
    'Description': 'Handcrafted bridal velvet bangle set.',
  },
  {
    // INTENTIONAL WARNING: Short title & missing weight
    'Product Title': 'Shoe',
    'SKU ID': 'FOOT-SNKR-WHT-005',
    'Style Code': 'STYLE-FOOT-401',
    'Brand Name': 'UrbanStep',
    'Category': 'Footwear',
    'Sub Category': 'Sneakers',
    'Fabric Material': 'Synthetic Leather',
    'Selling Price (INR)': 899,
    'MRP (INR)': 1999,
    'Stock Qty': 60,
    'GST Rate (%)': 12,
    'HSN Code': '6402',
    'Package Weight (Grams)': 0,
    'Main Image URL': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    'Description': 'White casual sneakers.',
  },
  {
    'Product Title': 'Men Slim Fit Cotton Casual Shirt (Navy Blue)',
    'SKU ID': 'SHIRT-SLM-NVY-006',
    'Style Code': 'STYLE-SHIRT-501',
    'Brand Name': 'UrbanStyle',
    'Category': 'Men Clothing',
    'Sub Category': 'Casual Shirts',
    'Fabric Material': '100% Cotton',
    'Selling Price (INR)': 599,
    'MRP (INR)': 1499,
    'Stock Qty': 200,
    'GST Rate (%)': 5,
    'HSN Code': '6205',
    'Package Weight (Grams)': 220,
    'Main Image URL': 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80',
    'Description': 'Breathable cotton casual shirt with spread collar.',
  },
  {
    'Product Title': 'Handcrafted Leather Sling Bag for Women',
    'SKU ID': 'BAG-SLNG-BRN-007',
    'Style Code': 'STYLE-BAG-601',
    'Brand Name': 'Listivo Craft',
    'Category': 'Bags & Luggage',
    'Sub Category': 'Sling Bags',
    'Fabric Material': 'PU Leather',
    'Selling Price (INR)': 499,
    'MRP (INR)': 1299,
    'Stock Qty': 90,
    'GST Rate (%)': 18,
    'HSN Code': '4202',
    'Package Weight (Grams)': 320,
    'Main Image URL': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80',
    'Description': 'Stylish crossbody sling bag with adjustable strap.',
  },
];

export function downloadSampleCatalog(format: 'csv' | 'xlsx' = 'csv') {
  const fileName = `Listivo_Sample_Catalog_25Rows.${format}`;
  if (format === 'xlsx') {
    const worksheet = XLSX.utils.json_to_sheet(SAMPLE_CATALOG_DATA);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sample_Catalog');
    XLSX.writeFile(workbook, fileName);
  } else {
    const csv = Papa.unparse(SAMPLE_CATALOG_DATA);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
