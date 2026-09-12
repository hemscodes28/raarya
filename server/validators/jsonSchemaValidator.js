export class JsonSchemaValidator {
  validateAndSanitize(data, fallbackIntent = 'PROPERTY_SEARCH', defaultProperties = []) {
    const validIntents = [
      'GENERAL_CONVERSATION',
      'WEBSITE_QUERY',
      'PROPERTY_SEARCH',
      'PROPERTY_DETAIL',
      'PROPERTY_FOLLOW_UP',
      'UNKNOWN'
    ];

    if (!data || typeof data !== 'object') {
      return {
        success: false,
        intent: fallbackIntent,
        message: typeof data === 'string' ? data : 'I processed your request.',
        filters: {},
        propertyIds: defaultProperties.map(p => p.id),
        sources: ['property_data']
      };
    }

    // 1. Sanitize Intent
    let intent = String(data.intent || fallbackIntent).toUpperCase().trim();
    if (!validIntents.includes(intent)) {
      intent = fallbackIntent;
    }

    // 2. Sanitize Message
    const message = String(data.message || data.content || 'Here are the results matching your query.').trim();

    // 3. Sanitize Filters
    const filters = (data.filters && typeof data.filters === 'object') ? data.filters : {};

    // 4. Sanitize Property IDs array
    let propertyIds = [];
    if (Array.isArray(data.propertyIds)) {
      propertyIds = data.propertyIds.map(id => String(id).trim()).filter(Boolean);
    } else if (Array.isArray(data.properties)) {
      propertyIds = data.properties.map(p => String(p.id || p)).filter(Boolean);
    } else {
      propertyIds = defaultProperties.map(p => p.id);
    }

    // 5. Sanitize Sources array
    let sources = [];
    if (Array.isArray(data.sources)) {
      sources = data.sources.map(s => String(s).trim());
    } else {
      sources = ['property_data'];
    }

    return {
      success: true,
      intent,
      message,
      filters,
      propertyIds,
      sources
    };
  }
}

export const jsonSchemaValidator = new JsonSchemaValidator();
