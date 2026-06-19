import json
import os
import psycopg2


ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'timoha777')


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def check_auth(event: dict) -> bool:
    params = event.get('queryStringParameters') or {}
    return params.get('pwd') == ADMIN_PASSWORD


def handler(event: dict, context) -> dict:
    """Админка: получение заявок на возврат и сообщений чата."""

    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    if not check_auth(event):
        return {'statusCode': 403, 'headers': headers, 'body': json.dumps({'error': 'forbidden'})}

    params = event.get('queryStringParameters') or {}
    section = params.get('section', 'refunds')

    conn = get_conn()
    cur = conn.cursor()

    if section == 'refunds':
        cur.execute("SELECT id, name, email, order_info, reason, created_at FROM refund_requests ORDER BY created_at DESC")
        rows = cur.fetchall()
        data = [{'id': r[0], 'name': r[1], 'email': r[2], 'order_info': r[3], 'reason': r[4], 'created_at': r[5].isoformat()} for r in rows]
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'refunds': data})}

    if section == 'chats':
        cur.execute("SELECT DISTINCT session_id, MAX(created_at) as last_at FROM chat_messages GROUP BY session_id ORDER BY last_at DESC")
        sessions = cur.fetchall()
        result = []
        for s in sessions:
            sid = s[0]
            cur.execute("SELECT id, sender, message, created_at FROM chat_messages WHERE session_id = %s ORDER BY created_at ASC", (sid,))
            msgs = cur.fetchall()
            result.append({
                'session_id': sid,
                'last_at': s[1].isoformat(),
                'messages': [{'id': m[0], 'sender': m[1], 'message': m[2], 'created_at': m[3].isoformat()} for m in msgs]
            })
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'chats': result})}

    if section == 'reply' and event.get('httpMethod') == 'POST':
        raw_body = event.get('body') or '{}'
        body = json.loads(raw_body) if isinstance(raw_body, str) else raw_body
        if isinstance(body, str):
            body = json.loads(body)
        session_id = body.get('session_id', '')
        message = (body.get('message') or '').strip()
        if not session_id or not message:
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'session_id and message required'})}
        cur.execute("INSERT INTO chat_messages (session_id, sender, message) VALUES (%s, 'seller', %s) RETURNING id", (session_id, message))
        row = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'id': row[0]})}

    cur.close()
    conn.close()
    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'unknown section'})}
