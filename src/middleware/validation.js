const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors 
      });
    }
    
    next();
  };
};

const schemas = {
  createAccount: Joi.object({
    accountTypeId: Joi.string().uuid().required(),
    code: Joi.string().required(),
    name: Joi.string().required(),
    description: Joi.string().allow('', null),
    parentAccountId: Joi.string().uuid().allow(null),
    currency: Joi.string().length(3).default('USD'),
    isActive: Joi.boolean().default(true)
  }),
  
  createJournalEntry: Joi.object({
    entryDate: Joi.date().required(),
    description: Joi.string().required(),
    reference: Joi.string().allow('', null),
    lines: Joi.array().items(
      Joi.object({
        accountId: Joi.string().uuid().required(),
        debit: Joi.number().min(0).default(0),
        credit: Joi.number().min(0).default(0),
        description: Joi.string().allow('', null)
      })
    ).min(2).required()
  }),
  
  createInvoice: Joi.object({
    customerId: Joi.string().uuid().required(),
    invoiceDate: Joi.date().required(),
    dueDate: Joi.date().required(),
    currency: Joi.string().length(3).default('USD'),
    notes: Joi.string().allow('', null),
    terms: Joi.string().allow('', null),
    lines: Joi.array().items(
      Joi.object({
        description: Joi.string().required(),
        quantity: Joi.number().positive().required(),
        unitPrice: Joi.number().min(0).required(),
        taxRate: Joi.number().min(0).max(100).default(0),
        accountId: Joi.string().uuid().allow(null)
      })
    ).min(1).required()
  }),
  
  createCustomer: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().allow('', null),
    phone: Joi.string().allow('', null),
    billingAddress: Joi.string().allow('', null),
    shippingAddress: Joi.string().allow('', null),
    taxId: Joi.string().allow('', null),
    paymentTerms: Joi.number().integer().min(0).default(30),
    creditLimit: Joi.number().min(0).allow(null),
    isActive: Joi.boolean().default(true)
  }),
  
  createPayment: Joi.object({
    paymentDate: Joi.date().required(),
    paymentType: Joi.string().valid('customer', 'vendor').required(),
    customerId: Joi.string().uuid().when('paymentType', {
      is: 'customer',
      then: Joi.required(),
      otherwise: Joi.allow(null)
    }),
    vendorId: Joi.string().uuid().when('paymentType', {
      is: 'vendor',
      then: Joi.required(),
      otherwise: Joi.allow(null)
    }),
    amount: Joi.number().positive().required(),
    paymentMethod: Joi.string().required(),
    reference: Joi.string().allow('', null),
    notes: Joi.string().allow('', null),
    accountId: Joi.string().uuid().required(),
    applications: Joi.array().items(
      Joi.object({
        invoiceId: Joi.string().uuid().when('paymentType', {
          is: 'customer',
          then: Joi.required(),
          otherwise: Joi.forbidden()
        }),
        billId: Joi.string().uuid().when('paymentType', {
          is: 'vendor',
          then: Joi.required(),
          otherwise: Joi.forbidden()
        }),
        amountApplied: Joi.number().positive().required()
      })
    ).allow(null)
  })
};

module.exports = { validate, schemas };
