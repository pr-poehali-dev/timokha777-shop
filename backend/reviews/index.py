import json
import os
import psycopg2


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def handler(event: dict, context) -> dict:
    """Отзывы покупателей. GET — получить список, POST — добавить новый."""

    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    method = event.get('httpMethod', 'GET')

    conn = get_conn()
    cur = conn.cursor()

    if method == 'GET':
        cur.execute("SELECT id, name, text, rating, created_at FROM reviews ORDER BY created_at DESC LIMIT 50")
        rows = cur.fetchall()
        reviews = [
            {'id': r[0], 'name': r[1], 'text': r[2], 'rating': r[3], 'created_at': r[4].isoformat()}
            for r in rows
        ]
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'reviews': reviews})}

    if method == 'POST':
        raw_body = event.get('body') or '{}'
        body = json.loads(raw_body) if isinstance(raw_body, str) else raw_body
        if isinstance(body, str):
            body = json.loads(body)

        name = (body.get('name') or '').strip()[:50]
        text = (body.get('text') or '').strip()[:500]
        rating = int(body.get('rating') or 5)

        if not name or not text:
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'name and text required'})}

        if rating < 1 or rating > 5:
            rating = 5

        cur.execute(
            "INSERT INTO reviews (name, text, rating) VALUES (%s, %s, %s) RETURNING id",
            (name, text, rating)
        )
        row = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()

        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'id': row[0]})}

    return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'method not allowed'})}
