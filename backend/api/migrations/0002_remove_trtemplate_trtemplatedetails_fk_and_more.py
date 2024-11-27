# Generated by Django 5.1.1 on 2024-11-27 00:53

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='trtemplate',
            name='TRTemplateDetails_FK',
        ),
        migrations.RemoveField(
            model_name='trtemplatedetails',
            name='DC_Flag',
        ),
        migrations.AddField(
            model_name='trtemplate',
            name='details',
            field=models.ManyToManyField(related_name='templates', to='api.trtemplatedetails'),
        ),
        migrations.AddField(
            model_name='trtemplatedetails',
            name='Credit',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='trtemplatedetails',
            name='Debit',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='trtemplate',
            name='TRTemplateCode',
            field=models.CharField(max_length=50),
        ),
        migrations.AlterField(
            model_name='trtemplate',
            name='TransactionType_FK',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.transactiontype'),
        ),
        migrations.AlterField(
            model_name='trtemplatedetails',
            name='Account_FK',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.chartofaccs'),
        ),
    ]
