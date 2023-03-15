# 1 - Export RE slides and name each level folder according to the eslo code
# 2 - Place the level folders under the version folder in  this directory
# 4 - Run script for the version created.

# On gcloud SDK, copy renamed files to bucket with material:
# gsutil -m cp -r /Users/raoniaraujo/dev/eslo/eslo-platform/backend/app/db/seeders/seeders_data/v1.0.0/audio/** gs://eslo-platform-material-dev/EE/v1.0.0

# gs://eslo-platform-material/EE/v1.0.0/EE-IND-B2/ee-ind-b2-l20-act-1-1.png
# https://storage.cloud.google.com/eslo-platform-material-dev/EE/v1.0.0/EE-BSC-A1/ee-bsc-a1-l2-act-5-slide-1.png

# Set seed version
SEED_VERSION = 'v1.0.0'


# Convert CSV to JSON files
def rename_audio_files():
    import csv
    import os

    # register pipe delimited dialect
    csv.register_dialect('piper', delimiter='|', quoting=csv.QUOTE_NONE)
    csv_filepath = '{version}/csv/audio.csv'.format(version=SEED_VERSION)

    with open(csv_filepath) as csv_file:
        for row in csv.DictReader(csv_file, dialect='piper'):
            old_filepath = '{version}/audio/{old_file}'.format(version=SEED_VERSION, old_file=row['old_filename'])
            new_filepath = '{version}/audio/{level}/{new_file}'.format(version=SEED_VERSION, level=row['new_filename'][:9].upper(), new_file=row['new_filename'])
            # print(old_filepath, new_filepath)
            os.rename(old_filepath, new_filepath)

# Rename book/scripts according to eslo codes
rename_audio_files()
