# 1 - Export RE slides and name each level folder according to the eslo code
# 2 - Place the level folders under the version folder in  this directory
# 4 - Run script for the version created.

# On gcloud SDK, copy renamed files to bucket with material:
# gsutil -m cp -r /Users/raoniaraujo/dev/eslo/eslo-platform/backend/app/db/seeders/seeders_data/v1.0.0/book/** gs://eslo-platform-material-dev/EE/v1.0.0

# gs://eslo-platform-material/EE/v1.0.0/EE-IND-B2/ee-ind-b2-l20-act-1-1.png
# https://storage.cloud.google.com/eslo-platform-material-dev/EE/v1.0.0/EE-BSC-A1/ee-bsc-a1-l2-act-5-slide-1.png

# Set seed version
SEED_VERSION = 'v1.0.0'


# Convert CSV to JSON files
def rename_book_files():
    import csv
    import os

    # register pipe delimited dialect
    csv.register_dialect('piper', delimiter='|', quoting=csv.QUOTE_NONE)
    csv_filepath = '{version}/csv/lesson.csv'.format(version=SEED_VERSION)

    with open(csv_filepath) as csv_file:
        for row in csv.DictReader(csv_file, dialect='piper'):
            for index in range (1,3):
                # book
                old_filepath = '{version}/book/{code}/book-{index}.png'.format(version=SEED_VERSION, code=row['code'], index=index)
                new_filepath = '{version}/book/{level}/{code}-book-{index}.png'.format(version=SEED_VERSION, level=row['code'][:9], code=row['code'].lower(), index=index)
                print(old_filepath, new_filepath)
                os.rename(old_filepath, new_filepath)

                # script
                old_filepath = '{version}/book/{code}/script-{index}.png'.format(version=SEED_VERSION, code=row['code'], index=index)
                new_filepath = '{version}/book/{level}/{code}-script-{index}.png'.format(version=SEED_VERSION, level=row['code'][:9], code=row['code'].lower(), index=index)
                print(old_filepath, new_filepath)
                os.rename(old_filepath, new_filepath)

# Rename book/scripts according to eslo codes
rename_book_files()
