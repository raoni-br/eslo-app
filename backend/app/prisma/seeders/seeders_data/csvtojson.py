# 1 - On Google Sheets, export tabs as TSV files
# 2 - Replace Tab to Pipe (|) delimiters.
# 3 - Create version folders and place files created.
# 4 - Run script for the version created.

# On Google Sheets, use this function to create slugs from lesson titles:
# =LOWER(SUBSTITUTE(REGEXREPLACE(C2;"[^a-zA-Z ]";""); " "; "-"))

# Set seed version
SEED_VERSION = 'v1.0.0'

# Set files to be converted
FILES = ['program', 'module', 'level', 'lesson', 'activity']

# Convert CSV to JSON files
def convert_csv_to_json():
    import csv
    import json

    # register pipe delimited dialect
    csv.register_dialect('piper', delimiter='|', quoting=csv.QUOTE_NONE)

    for filename in FILES:
        json_list = []
        csv_filepath = '{version}/csv/{filename}.csv'.format(version=SEED_VERSION, filename=filename)
        with open(csv_filepath) as csv_file:
            for row in csv.DictReader(csv_file, dialect='piper'):
                json_list.append(row)
        
        json_filepath = '{version}/json/{filename}.json'.format(version=SEED_VERSION, filename=filename)
        with open(json_filepath, 'w')  as json_file:
            json_file.write(json.dumps(json_list, indent=4))

# Convert CSV to JSON for each file in the list
convert_csv_to_json()
