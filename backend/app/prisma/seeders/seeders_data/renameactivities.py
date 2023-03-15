# 1 - Export RE slides and name each level folder according to the eslo code
# 2 - Place the level folders under the version folder in  this directory
# 4 - Run script for the version created.

# On gcloud SDK, copy renamed files to bucket with material:
# gsutil -m cp -r /Users/raoniaraujo/dev/eslo/eslo-platform/backend/app/db/seeders/seeders_data/v1.0.0/slides gs://eslo-platform-material-dev/EE/v1.0.0

# gs://eslo-platform-material/EE/v1.0.0/EE-IND-B2/ee-ind-b2-l20-act-1-1.png
# https://storage.cloud.google.com/eslo-platform-material-dev/EE/v1.0.0/EE-BSC-A1/ee-bsc-a1-l2-act-5-slide-1.png

# Set seed version
SEED_VERSION = 'v1.0.0'


# Convert CSV to JSON files
def rename_activity_slides_file():
    import csv
    import os

    # register pipe delimited dialect
    csv.register_dialect('piper', delimiter='|', quoting=csv.QUOTE_NONE)

    csv_filepath = '{version}/csv/activity.csv'.format(version=SEED_VERSION)
    level_dict = {
        'EE-BSC-A1': [],
        'EE-BSC-A2': [],
        'EE-IND-B1': [],
        'EE-IND-B2': [],
        'EE-PRO-C1': []
    }

    with open(csv_filepath) as csv_file:
        for row in csv.DictReader(csv_file, dialect='piper'):
            level_dict[row['lesson_code'][:9]].append(row)

    for level, activities in level_dict.items():
        current_slide = 0
        previous_lesson = None
        for activity in activities:
            # Lesson cover
            if activity['lesson_code'] != previous_lesson:
                previous_lesson = activity['lesson_code']
                current_slide += 1
                old_filepath = '{version}/slides/{level}/Slide{index}.PNG'.format(version=SEED_VERSION, level=level, index=current_slide)
                new_filepath = '{version}/slides/{level}/{act_code}-0-cover.png'.format(version=SEED_VERSION, level=level, act_code=activity['code'].lower())
                # print(old_filepath, new_filepath)
                os.rename(old_filepath, new_filepath)

            for slide_index in range(1, int(activity['slides_count']) + 1):
                current_slide += 1
                old_filepath = '{version}/slides/{level}/Slide{index}.PNG'.format(version=SEED_VERSION, level=level, index=current_slide)
                new_filepath = '{version}/slides/{level}/{act_code}-slide-{index}.png'.format(version=SEED_VERSION, level=level, act_code=activity['code'].lower(), index=slide_index)
                # print(old_filepath, new_filepath)
                os.rename(old_filepath, new_filepath)


# Rename slides according to eslo codes
rename_activity_slides_file()
