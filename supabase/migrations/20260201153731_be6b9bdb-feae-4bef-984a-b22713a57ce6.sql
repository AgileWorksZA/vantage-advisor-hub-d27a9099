-- Create clients table with all fields from the CRM system
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Profile state and type
  profile_state TEXT NOT NULL DEFAULT 'Active' CHECK (profile_state IN ('Active', 'Inactive', 'Deceased')),
  profile_type TEXT NOT NULL DEFAULT 'Prospect' CHECK (profile_type IN ('Lead', 'Prospect', 'Client')),
  client_type TEXT NOT NULL DEFAULT 'individual' CHECK (client_type IN ('individual', 'family', 'business')),
  
  -- Identification
  title TEXT,
  first_name TEXT NOT NULL,
  surname TEXT NOT NULL,
  initials TEXT,
  preferred_name TEXT,
  id_number TEXT,
  passport_number TEXT,
  country_of_issue TEXT DEFAULT 'South Africa',
  person_type TEXT DEFAULT 'Individual',
  nationality TEXT DEFAULT 'South African',
  
  -- Demographics
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  date_of_birth DATE,
  language TEXT DEFAULT 'English',
  race TEXT,
  religion TEXT,
  
  -- Contact details
  email TEXT,
  work_email TEXT,
  cell_number TEXT,
  work_number TEXT,
  work_extension TEXT,
  home_number TEXT,
  fax_number TEXT,
  
  -- Social media
  website TEXT,
  skype TEXT,
  facebook TEXT,
  linkedin TEXT,
  twitter TEXT,
  youtube TEXT,
  
  -- Professional info
  is_smoker BOOLEAN DEFAULT false,
  is_professional BOOLEAN DEFAULT false,
  profession TEXT,
  occupation TEXT,
  industry TEXT,
  employer TEXT,
  disability_type TEXT,
  is_hybrid_client BOOLEAN DEFAULT false,
  
  -- Tax info
  tax_number TEXT,
  tax_resident_country TEXT DEFAULT 'South Africa',
  
  -- Addresses (stored as JSONB for flexibility)
  residential_address JSONB,
  postal_address JSONB,
  
  -- Preferences
  preferred_contact TEXT DEFAULT 'Email' CHECK (preferred_contact IN ('Email', 'Phone', 'SMS', 'Post')),
  preferred_phone TEXT CHECK (preferred_phone IN ('Cell', 'Work', 'Home')),
  preferred_email TEXT CHECK (preferred_email IN ('Personal', 'Work')),
  otp_delivery_method TEXT DEFAULT 'SMS' CHECK (otp_delivery_method IN ('SMS', 'Email')),
  
  -- Assignment
  advisor TEXT,
  wealth_manager TEXT,
  relationship TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  
  -- Sports interests (array)
  sports_interests TEXT[],
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for common queries
CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_clients_profile_type ON public.clients(profile_type);
CREATE INDEX idx_clients_profile_state ON public.clients(profile_state);
CREATE INDEX idx_clients_surname ON public.clients(surname);
CREATE INDEX idx_clients_email ON public.clients(email);

-- Enable Row Level Security
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only access their own clients
CREATE POLICY "Users can view their own clients" 
ON public.clients 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clients" 
ON public.clients 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients" 
ON public.clients 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients" 
ON public.clients 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();