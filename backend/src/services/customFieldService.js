const { query } = require('../config/db');

/**
 * Get all custom fields for a specific module and company
 */
const getFieldDefinitions = async (companyId, moduleName) => {
  const result = await query(
    'SELECT * FROM custom_fields WHERE company_id = $1 AND module = $2 ORDER BY created_at ASC',
    [companyId, moduleName]
  );
  return result.rows;
};

/**
 * Get custom field values for a specific entity (e.g., employee)
 */
const getEntityValues = async (companyId, entityId) => {
  const result = await query(
    `SELECT cf.field_name, cf.field_type, cf.is_required, cf.options, cfv.value, cfv.field_id
     FROM custom_field_values cfv
     JOIN custom_fields cf ON cfv.field_id = cf.id
     WHERE cfv.company_id = $1 AND cfv.entity_id = $2`,
    [companyId, entityId]
  );
  return result.rows;
};

/**
 * Save or update custom field values for an entity
 * @param {string} companyId 
 * @param {string} entityId 
 * @param {Object} valuesMapping - { field_id: value }
 */
const saveEntityValues = async (companyId, entityId, valuesMapping) => {
  const queries = Object.entries(valuesMapping).map(([fieldId, value]) => {
    return query(
      `INSERT INTO custom_field_values (company_id, entity_id, field_id, value)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (entity_id, field_id) DO UPDATE SET value = EXCLUDED.value`,
      [companyId, entityId, fieldId, value]
    );
  });
  
  await Promise.all(queries);
};

module.exports = { getFieldDefinitions, getEntityValues, saveEntityValues };
