#!/usr/bin/env python3
"""
PostgreSQL Data Enrichment Script with OpenAI Translation
Fetches content from database, generates Vietnamese translation dictionaries using OpenAI,
and updates the database with the results.
"""

import os
import json
from supabase import create_client, Client
from openai import OpenAI
import sys

def get_database_connection() -> Client:
    """Initialize Supabase client using environment variables."""
    try:
        supabase_url = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
        supabase_key = os.environ.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')
        if not supabase_url or not supabase_key:
            raise ValueError("Supabase URL or anon key not found in environment variables")
        
        supabase = create_client(supabase_url, supabase_key)
        print("Successfully connected to Supabase")
        return supabase
    except Exception as e:
        print(f"Error connecting to Supabase: {e}")
        sys.exit(1)

def get_openai_client():
    """Initialize OpenAI client using OPENAI_API_KEY from secrets."""
    try:
        api_key = os.environ.get('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")
        
        client = OpenAI(api_key=api_key)
        print("Successfully initialized OpenAI client")
        return client
    except Exception as e:
        print(f"Error initializing OpenAI client: {e}")
        sys.exit(1)

def fetch_content_rows(supabase, field_choice='short_blurb'):
    """Fetch content rows that need translation dictionaries."""
    try:
        # Choose which field to process
        field_name = field_choice if field_choice in ['short_blurb', 'short_description'] else 'short_blurb'
        print(f"Processing field: {field_name}")

        response = supabase \
            .from_('content') \
            .select(f'id, {field_name}') \
            .is_('translation_dictionary', None) \
            .not_(field_name, 'is', None) \
            .neq(field_name, '') \
            .limit(300) \
            .execute()

        if response.error:
            print(f"Error fetching content rows: {response.error.message}")
            return []

        rows = response.data
        print(f"Fetched {len(rows)} rows for processing")
        return rows
    except Exception as e:
        print(f"Error fetching content rows: {e}")
        return []

def update_translation_dictionary(supabase, content_id, translation_dict):
    """Update the translation_dictionary column for the specified content ID."""
    try:
        response = supabase
            .from_('content')
            .update({'translation_dictionary': translation_dict})
            .eq('id', content_id)
            .execute()

        if response.error:
            print(f"Error updating database for content ID {content_id}: {response.error.message}")
            return False

        return True
    except Exception as e:
        print(f"Error updating database for content ID {content_id}: {e}")
        return False

def main():
    """Main function to orchestrate the data enrichment process."""
    print("Starting Supabase data enrichment with OpenAI translations")

    # Initialize connections
    supabase = get_database_connection()
    client = get_openai_client()

    try:
        # Fetch content rows that need processing
        rows = fetch_content_rows(supabase, 'short_blurb')

        if not rows:
            print("No rows found that need translation dictionaries")
            return

        # Process each row
        for row in rows:
            content_id = row['id']
            content_text = row.get('short_blurb') or row.get('short_description') or ''

            print(f"Processing content ID: {content_id}")

            # Skip if content_text is empty or None
            if not content_text.strip():
                print(f"Skipping content ID {content_id}: empty content_text")
                continue

            # Generate translation dictionary using OpenAI
            ai_response = generate_translation_dictionary(client, content_text)

            if not ai_response:
                print(f"Failed to get response from OpenAI for content ID {content_id}")
                continue

            # Parse JSON response - clean up markdown formatting if present
            try:
                # Remove markdown code block formatting if present
                cleaned_response = ai_response.strip()
                if cleaned_response.startswith('```json'):
                    cleaned_response = cleaned_response[7:]  # Remove ```json
                if cleaned_response.startswith('```'):
                    cleaned_response = cleaned_response[3:]   # Remove ```
                if cleaned_response.endswith('```'):
                    cleaned_response = cleaned_response[:-3]  # Remove trailing ```
                cleaned_response = cleaned_response.strip()

                translation_dict = json.loads(cleaned_response)

                # Validate that it's a dictionary
                if not isinstance(translation_dict, dict):
                    print(f"Error for content ID {content_id}: AI response is not a valid dictionary")
                    continue

                # Update database
                if update_translation_dictionary(supabase, content_id, translation_dict):
                    print(f"Successfully updated content ID: {content_id}")
                    print(f"Translation dictionary: {translation_dict}")
                else:
                    print(f"Failed to update database for content ID {content_id}")

            except json.JSONDecodeError as e:
                print(f"Error parsing JSON for content ID {content_id}: {e}")
                print(f"AI response was: {ai_response}")
                continue
            except Exception as e:
                print(f"Unexpected error processing content ID {content_id}: {e}")
                continue

    except Exception as e:
        print(f"Unexpected error in main processing: {e}")

    print("Data enrichment process completed")

if __name__ == "__main__":
    main()
                if cleaned_response.endswith('```'):
