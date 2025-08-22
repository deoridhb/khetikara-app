import { supabase } from '../lib/supabase';

// Products
export const getProducts = async () => {
  const { data, error } = await supabase
    .from('products_with_grades')
    .select('*')
    .eq('is_active', true)
    .order('featured', { ascending: false })
    .order('name');
  
  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
  return data || [];
};

export const getFeaturedProducts = async () => {
  const { data, error } = await supabase
    .from('products_with_grades')
    .select('*')
    .eq('is_active', true)
    .eq('featured', true)
    .order('name')
    .limit(6);
  
  if (error) {
    console.error('Error fetching featured products:', error);
    throw error;
  }
  return data || [];
};

export const getProductById = async (id) => {
  const { data, error } = await supabase
    .from('products_with_grades')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();
  
  if (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
  return data;
};

// Orders
export const createOrder = async (orderData) => {
  // Generate order number
  const orderNumber = `ORD${Date.now().toString().slice(-8)}${Math.random().toString(36).slice(-4).toUpperCase()}`;

  const {
    customerName,
    customerPhone,
    languagePreference,
    items,
    delivery
  } = orderData;

  // Calculate totals
  const itemsTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const handlingFee = 40; // Fixed handling fee
  const totalAmount = itemsTotal + handlingFee;

  try {
    // Start a Supabase transaction
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        order_number: orderNumber,
        customer_name: customerName,
        customer_phone: customerPhone,
        language_preference: languagePreference,
        items_total: itemsTotal,
        handling_fee: handlingFee,
        total_amount: totalAmount,
        status: 'pending'
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      product_variety: item.variety,
      grade_key: item.grade,
      grade_label: `${item.grade} - ${item.grade === 'A1' ? 'Premium' : item.grade === 'A2' ? 'Standard' : 'Economy'} Grade`,
      unit_price: item.price,
      quantity: item.quantity,
      total_price: item.price * item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Insert delivery address
    const { error: addressError } = await supabase
      .from('delivery_addresses')
      .insert([{
        order_id: order.id,
        name: delivery.name,
        phone: delivery.phone,
        flat_address: delivery.address,
        pin_code: delivery.pinCode
      }]);

    if (addressError) throw addressError;

    return { orderNumber };
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error('Failed to create order. Please try again.');
  }
};