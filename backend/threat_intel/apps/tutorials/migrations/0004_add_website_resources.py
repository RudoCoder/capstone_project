from django.db import migrations, models


NEW_RESOURCES = [
    # ── Videos ──────────────────────────────────────────────────────────────
    {
        'title': 'What is Cyber Threat Intelligence?',
        'description': (
            'A concise IBM Technology explainer covering what CTI is, why organisations collect it, '
            'and how it feeds into defensive security operations.'
        ),
        'url': 'https://www.youtube.com/watch?v=hB5ceFauqYE',
        'tutorial_type': 'video',
        'order': 10,
    },
    {
        'title': 'MITRE ATT&CK Framework Overview',
        'description': (
            'Introduction to the MITRE ATT&CK matrix — tactics, techniques, and procedures (TTPs) '
            'used by real-world threat actors, and how defenders use it for detection engineering.'
        ),
        'url': 'https://www.youtube.com/watch?v=GYyLnff2XRo',
        'tutorial_type': 'video',
        'order': 11,
    },
    {
        'title': 'YARA Rules for Malware Detection',
        'description': (
            'Practical walkthrough of writing YARA rules to identify malware families by '
            'string patterns, byte sequences, and metadata conditions.'
        ),
        'url': 'https://www.youtube.com/watch?v=x8RWzPbZ5V8',
        'tutorial_type': 'video',
        'order': 12,
    },
    {
        'title': 'IOC Analysis & Threat Hunting',
        'description': (
            'Hands-on threat hunting session demonstrating how to pivot on IP addresses, '
            'domains, and file hashes to uncover attacker infrastructure.'
        ),
        'url': 'https://www.youtube.com/watch?v=E5EBjZvAXAg',
        'tutorial_type': 'video',
        'order': 13,
    },

    # ── External Websites ────────────────────────────────────────────────────
    {
        'title': 'MITRE ATT&CK',
        'description': (
            'The definitive knowledge base of adversary tactics and techniques based on real-world '
            'observations. Use it to map detections, understand attacker behaviour, and build '
            'threat models.'
        ),
        'url': 'https://attack.mitre.org/',
        'tutorial_type': 'website',
        'order': 20,
    },
    {
        'title': 'VirusTotal',
        'description': (
            'Free online service that analyses files, URLs, domains, and IPs against 70+ antivirus '
            'engines and threat intelligence feeds — essential for quick IOC enrichment.'
        ),
        'url': 'https://www.virustotal.com/',
        'tutorial_type': 'website',
        'order': 21,
    },
    {
        'title': 'CISA Cyber Threats & Advisories',
        'description': (
            'US Cybersecurity and Infrastructure Security Agency advisories, alerts, and malware '
            'analysis reports on active threats and vulnerabilities.'
        ),
        'url': 'https://www.cisa.gov/topics/cyber-threats-and-advisories',
        'tutorial_type': 'website',
        'order': 22,
    },
    {
        'title': 'AlienVault OTX',
        'description': (
            'Open Threat Exchange — community-driven threat intelligence platform with pulses '
            'containing IOCs, TTPs, and threat actor data shared by researchers worldwide.'
        ),
        'url': 'https://otx.alienvault.com/',
        'tutorial_type': 'website',
        'order': 23,
    },
    {
        'title': 'Abuse.ch Threat Intelligence',
        'description': (
            'Community platforms tracking malware (MalwareBazaar), botnet C2s (Feodo Tracker), '
            'and ransomware infrastructure — includes downloadable IOC feeds.'
        ),
        'url': 'https://abuse.ch/',
        'tutorial_type': 'website',
        'order': 24,
    },
]


def seed_resources(apps, schema_editor):
    Tutorial = apps.get_model('tutorials', 'Tutorial')
    existing_titles = set(Tutorial.objects.values_list('title', flat=True))
    for data in NEW_RESOURCES:
        if data['title'] not in existing_titles:
            Tutorial.objects.create(**data)


def unseed_resources(apps, schema_editor):
    Tutorial = apps.get_model('tutorials', 'Tutorial')
    Tutorial.objects.filter(title__in=[r['title'] for r in NEW_RESOURCES]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('tutorials', '0003_seed_tutorials'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tutorial',
            name='tutorial_type',
            field=models.CharField(
                max_length=20,
                choices=[
                    ('document', 'Google Drive Document'),
                    ('video', 'YouTube Video'),
                    ('website', 'External Website'),
                ],
            ),
        ),
        migrations.RunPython(seed_resources, unseed_resources),
    ]
