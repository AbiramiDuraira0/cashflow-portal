-- public.investment definition

-- Drop table

-- DROP TABLE public.investment;

CREATE TABLE public.investment (
	investment_id serial4 NOT NULL,
	"type" varchar(50) NOT NULL,
	status varchar(20) NOT NULL DEFAULT 'Active'::character varying,
	"name" varchar(255) NOT NULL,
	notes text NULL,
	is_deleted bool NOT NULL DEFAULT false,
	created_at timestamptz NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamptz NULL DEFAULT CURRENT_TIMESTAMP,
	"year" int4 NOT NULL,
	invested_amount numeric(15, 2) NOT NULL,
	interest_earned numeric(15, 2) NULL DEFAULT 0,
	CONSTRAINT chk_interest_earned_non_negative CHECK ((interest_earned >= (0)::numeric)),
	CONSTRAINT chk_invested_amount_positive CHECK ((invested_amount >= (0)::numeric)),
	CONSTRAINT chk_year_range CHECK (((year >= 2000) AND (year <= 2100))),
	CONSTRAINT investment_pkey PRIMARY KEY (investment_id),
	CONSTRAINT investment_status_check CHECK (((status)::text = ANY ((ARRAY['Active'::character varying, 'Past'::character varying, 'To-do'::character varying])::text[]))),
	CONSTRAINT investment_type_check CHECK (((type)::text = ANY ((ARRAY['Physical Gold'::character varying, 'MF - SIP'::character varying, 'Stocks'::character varying, 'PPF'::character varying, 'PF'::character varying, 'NPS'::character varying, 'RD'::character varying, 'Land'::character varying, 'House'::character varying])::text[])))
);
CREATE INDEX idx_investment_is_deleted ON public.investment USING btree (is_deleted);
CREATE INDEX idx_investment_name_year ON public.investment USING btree (name, year);
CREATE INDEX idx_investment_status ON public.investment USING btree (status) WHERE (is_deleted = false);
CREATE INDEX idx_investment_type ON public.investment USING btree (type) WHERE (is_deleted = false);
CREATE INDEX idx_investment_type_status ON public.investment USING btree (type, status) WHERE (is_deleted = false);
CREATE INDEX idx_investment_year ON public.investment USING btree (year);

-- Table Triggers

create trigger trigger_update_investment_timestamp before
update
    on
    public.investment for each row execute function update_investment_timestamp();