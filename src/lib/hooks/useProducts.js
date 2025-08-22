import { useState, useEffect } from 'react'
import { getProducts, getFeaturedProducts, getCategories } from '../services/database'

export const useProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getProducts()
        setProducts(data)
      } catch (err) {
        console.error('Products hook error:', err)
        setError(err.message)
        setProducts([]) // Fallback to empty array
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return { products, loading, error, refetch: () => window.location.reload() }
}

export const useFeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getFeaturedProducts()
        setFeaturedProducts(data)
      } catch (err) {
        console.error('Featured products hook error:', err)
        setError(err.message)
        setFeaturedProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  return { featuredProducts, loading, error }
}

export const useCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getCategories()
        setCategories(data)
      } catch (err) {
        console.error('Categories hook error:', err)
        setError(err.message)
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading, error }
}