import { useState, useCallback } from 'react'

const validationRules = {
  required: (value) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return 'This field is required'
    }
    return null
  },
  
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (value && !emailRegex.test(value)) {
      return 'Please enter a valid email address'
    }
    return null
  },
  
  minLength: (min) => (value) => {
    if (value && value.length < min) {
      return `Must be at least ${min} characters long`
    }
    return null
  },
  
  maxLength: (max) => (value) => {
    if (value && value.length > max) {
      return `Must be no more than ${max} characters long`
    }
    return null
  },
  
  password: (value) => {
    if (!value) return 'Password is required'
    if (value.length < 8) return 'Password must be at least 8 characters long'
    if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter'
    if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter'
    if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number'
    return null
  },
  
  confirmPassword: (originalPassword) => (value) => {
    if (!value) return 'Please confirm your password'
    if (value !== originalPassword) return 'Passwords do not match'
    return null
  },
  
  name: (value) => {
    if (!value || !value.trim()) return 'Name is required'
    if (value.trim().length < 2) return 'Name must be at least 2 characters long'
    if (!/^[a-zA-Z\s'-]+$/.test(value)) return 'Name can only contain letters, spaces, hyphens, and apostrophes'
    return null
  }
}

export function useFormValidation(initialValues = {}, rules = {}) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateField = useCallback((name, value) => {
    const fieldRules = rules[name]
    if (!fieldRules) return null

    for (const rule of fieldRules) {
      let validator
      
      if (typeof rule === 'string') {
        validator = validationRules[rule]
      } else if (typeof rule === 'function') {
        validator = rule
      } else if (typeof rule === 'object') {
        const { type, ...params } = rule
        validator = validationRules[type]?.(params)
      }
      
      if (validator) {
        const error = validator(value, values)
        if (error) return error
      }
    }
    
    return null
  }, [rules, values])

  const validateForm = useCallback(() => {
    const newErrors = {}
    let isValid = true

    Object.keys(rules).forEach(name => {
      const error = validateField(name, values[name])
      if (error) {
        newErrors[name] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }, [rules, values, validateField])

  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }, [errors])

  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }))
  }, [])

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    const fieldValue = type === 'checkbox' ? checked : value
    setValue(name, fieldValue)
  }, [setValue])

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target
    setFieldTouched(name, true)
    
    // Validate on blur
    const error = validateField(name, value)
    setErrors(prev => ({ ...prev, [name]: error }))
  }, [validateField, setFieldTouched])

  const reset = useCallback((newValues = initialValues) => {
    setValues(newValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])

  const getFieldProps = useCallback((name) => ({
    name,
    value: values[name] || '',
    onChange: handleChange,
    onBlur: handleBlur,
    error: touched[name] ? errors[name] : null
  }), [values, handleChange, handleBlur, touched, errors])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setIsSubmitting,
    setValue,
    setFieldTouched,
    handleChange,
    handleBlur,
    validateForm,
    validateField,
    reset,
    getFieldProps,
    isValid: Object.keys(errors).length === 0
  }
}