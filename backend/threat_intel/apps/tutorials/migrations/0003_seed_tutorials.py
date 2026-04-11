from django.db import migrations


TUTORIALS = [
    {
        'title': 'Introduction',
        'description': (
            'Cyber threat intelligence (CTI) is the analyzed, evidence-based knowledge about malicious actors, '
            'their motives, and their attack methods (TTPs). It transforms raw data into actionable insights, '
            'helping organizations proactively defend against, detect, and mitigate cyber risks rather than '
            'just reacting to incidents.'
        ),
        'url': 'https://docs.google.com/document/d/1Sgcbxl2lCA_jPgJTVqBKnn5rAAAXPw_q/edit?usp=drive_link&ouid=102612865563887029106&rtpof=true&sd=true',
        'tutorial_type': 'document',
        'order': 0,
    },
    {
        'title': 'Stage 1',
        'description': 'Foundations of cyber threat intelligence — understanding the threat landscape, key terminology, and the intelligence lifecycle.',
        'url': 'https://docs.google.com/document/d/1RxNqWn-KPMa64EZzKzgxYp2X992rOqKI/edit?usp=drive_link&ouid=102612865563887029106&rtpof=true&sd=true',
        'tutorial_type': 'document',
        'order': 1,
    },
    {
        'title': 'Stage 2',
        'description': 'Data collection and source management — identifying reliable threat feeds, OSINT sources, and structured data ingestion techniques.',
        'url': 'https://docs.google.com/document/d/1hIFtdjhs1MCO9oDoULwD9mG5vY-Bry92/edit?usp=drive_link&ouid=102612865563887029106&rtpof=true&sd=true',
        'tutorial_type': 'document',
        'order': 2,
    },
    {
        'title': 'Stage 3',
        'description': 'Threat analysis techniques — processing raw indicators, pivoting on IOCs, and identifying patterns across datasets.',
        'url': 'https://docs.google.com/document/d/1Mubr95xM2pxwGS0GE7J2HodtJUmm0MDC/edit?usp=drive_link&ouid=102612865563887029106&rtpof=true&sd=true',
        'tutorial_type': 'document',
        'order': 3,
    },
    {
        'title': 'Stage 4',
        'description': 'Threat actor profiling — mapping TTPs to the MITRE ATT&CK framework, attributing campaigns, and building adversary profiles.',
        'url': 'https://docs.google.com/document/d/1AYtkwtAbSwKm5cb0MXztYogsy50fRli8/edit?usp=drive_link&ouid=102612865563887029106&rtpof=true&sd=true',
        'tutorial_type': 'document',
        'order': 4,
    },
    {
        'title': 'Stage 5',
        'description': 'Operationalizing intelligence — integrating CTI into SOC workflows, SIEM rules, and automated detection pipelines.',
        'url': 'https://docs.google.com/document/d/1hs1qF3VdXuau198UGySj6DFgfIYc3_2-/edit?usp=drive_link&ouid=102612865563887029106&rtpof=true&sd=true',
        'tutorial_type': 'document',
        'order': 5,
    },
    {
        'title': 'Stage 6',
        'description': 'Advanced CTI and reporting — producing actionable intelligence reports, disseminating findings, and measuring programme effectiveness.',
        'url': 'https://docs.google.com/document/d/1r8TeYccOjN2ENnr4MogPnITUnWR9LAPt/edit?usp=drive_link&ouid=102612865563887029106&rtpof=true&sd=true',
        'tutorial_type': 'document',
        'order': 6,
    },
]


def seed_tutorials(apps, schema_editor):
    Tutorial = apps.get_model('tutorials', 'Tutorial')
    # Only seed if table is empty
    if Tutorial.objects.exists():
        return
    for data in TUTORIALS:
        Tutorial.objects.create(**data)


def unseed_tutorials(apps, schema_editor):
    Tutorial = apps.get_model('tutorials', 'Tutorial')
    Tutorial.objects.filter(title__in=[t['title'] for t in TUTORIALS]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('tutorials', '0002_tutorial_order'),
    ]

    operations = [
        migrations.RunPython(seed_tutorials, unseed_tutorials),
    ]
