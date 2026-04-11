from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tutorials', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='tutorial',
            name='order',
            field=models.PositiveIntegerField(default=0, db_index=True),
        ),
    ]
