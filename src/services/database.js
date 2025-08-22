import { supabase } from '../lib/supabase'

// Products
export const getProducts = async () => {
  const { data, error } = await supabase
    .from('products_with_grades')
    .select('*')
    .eq('is_active', true)
    .order('featured', { ascending: false })
    .order('name')
  
  if (error) {
    console.error('Error fetching products:', error)
    throw error
  }
  return data || []
}

export const getFeaturedProducts = async () => {
  const { data, error } = await supabase
    .from('products_with_grades')
    .select('*')
    .eq('is_active', true)
    .eq('featured', true)
    .order('name')
    .limit(6)
  
  if (error) {
    console.error('Error fetching featured products:', error)
    throw error
  }
  return data || []
}

export const getProductById = async (id) => {
  const { data, error } = await supabase
    .from('products_with_grades')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()
  
  if (error) {
    console.error('Error fetching product:', error)
    throw error
  }
  return data
}

// Categories
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  
  if (error) {
    console.error('Error fetching categories:', error)
    throw error
  }
  return data || []
}

// Market Metrics
export const getMarketMetrics = async () => {
  const { data, error } = await supabase
    .from('market_metrics')
    .select('*')
    .order('recorded_at', { ascending: false })
    .limit(4)
  
  if (error) {
    console.error('Error fetching market metrics:', error)
    throw error
  }
  return data || []
}

// Orders
export const createOrder = async (orderData) => {
  try {
    // Create customer first
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .upsert({
        phone: orderData.customerPhone,
        name: orderData.customerName,
        language_preference: 'English'
      }, { onConflict: 'phone' })
      .select()
      .single()

    if (customerError) throw customerError

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customer.id,
        items_total: orderData.itemsTotal,
        delivery_fee: orderData.deliveryFee || 0,
        handling_fee: orderData.handlingFee || 0,
        discount_amount: orderData.discountAmount || 0,
        total_amount: orderData.totalAmount,
        savings_amount: orderData.savingsAmount || 0,
        delivery_addresses: orderData.addresses,
        customer_notes: orderData.notes,
        language_preference: orderData.languagePreference || 'English'
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Create order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      product_variety: item.variety || '',
      grade_key: item.selectedGrade || 'A1',
      grade_label: item.gradeName || 'A1 - Premium Grade',
      unit: item.unit,
      unit_price: item.price,
      mrp_price: item.mrp,
      quantity: item.quantity,
      total_price: item.totalPrice,
      savings_amount: item.savings || 0
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    return order
  } catch (error) {
    console.error('Error creating order:', error)
    throw error
  }
}

export const getOrderById = async (orderId) => {
  const { data, error } = await supabase
    .from('order_summary')
    .select('*')
    .eq('id', orderId)
    .single()
  
  if (error) {
    console.error('Error fetching order:', error)
    throw error
  }
  return data
}