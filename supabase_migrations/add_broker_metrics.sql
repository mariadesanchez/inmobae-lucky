-- Create property_transactions table
CREATE TABLE IF NOT EXISTS property_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    operation_type TEXT NOT NULL CHECK (operation_type IN ('venta', 'alquiler')),
    price NUMERIC NOT NULL,
    operation_date TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_property_transactions_property_id ON property_transactions(property_id);
CREATE INDEX IF NOT EXISTS idx_property_transactions_date ON property_transactions(operation_date);
