CREATE TABLE IF NOT EXISTS tc_template_records (
  id TEXT PRIMARY KEY,
  entity TEXT NOT NULL,
  data TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tc_template_records_entity ON tc_template_records(entity);
CREATE INDEX IF NOT EXISTS idx_tc_template_records_entity_updated ON tc_template_records(entity, updated_at);
