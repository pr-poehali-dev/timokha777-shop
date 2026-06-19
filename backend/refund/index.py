import json
import os
import psycopg2


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def handler(event: dict, context) -> dict:
    """Заявки на возврат. POST — создать заявку."""

    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    if event.get('httpMethod') != 'POST':
        return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'method not allowed'})}

    raw_body = event.get('body') or '{}'
    body = json.loads(raw_body) if isinstance(raw_body, str) else raw_body
    if isinstance(body, str):
        body = json.loads(body)

    name = (body.get('name') or '').strip()[:100]
    email = (body.get('email') or '').strip()[:200]
    order_info = (body.get('order_info') or '').strip()[:500]
    reason = (body.get('reason') or '').strip()[:1000]

    if not name or not email or not order_info or not reason:
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'all fields required'})}

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO refund_requests (name, email, order_info, reason) VALUES (%s, %s, %s, %s) RETURNING id",
        (name, email, order_info, reason)
    )
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'id': row[0], 'success': True})}
