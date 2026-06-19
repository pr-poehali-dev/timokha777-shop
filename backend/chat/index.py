import json
import os
import psycopg2
from datetime import datetime


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def handler(event: dict, context) -> dict:
    """Чат между покупателем и продавцом. GET — получить сообщения, POST — отправить."""

    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id',
        'Content-Type': 'application/json',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    req_headers = event.get('headers') or {}
    session_id = req_headers.get('X-Session-Id') or params.get('session_id', '')

    if not session_id:
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'session_id required'})}

    conn = get_conn()
    cur = conn.cursor()

    if method == 'GET':
        cur.execute(
            "SELECT id, sender, message, created_at FROM chat_messages WHERE session_id = %s ORDER BY created_at ASC",
            (session_id,)
        )
        rows = cur.fetchall()
        messages = [
            {'id': r[0], 'sender': r[1], 'message': r[2], 'created_at': r[3].isoformat()}
            for r in rows
        ]
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'messages': messages})}

    if method == 'POST':
        raw_body = event.get('body') or '{}'
        body = json.loads(raw_body) if isinstance(raw_body, str) else raw_body
        if isinstance(body, str):
            body = json.loads(body)
        message = (body.get('message') or '').strip()
        sender = body.get('sender', 'user')

        if sender not in ('user', 'seller'):
            sender = 'user'

        if not message:
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'message required'})}

        cur.execute(
            "INSERT INTO chat_messages (session_id, sender, message) VALUES (%s, %s, %s) RETURNING id, created_at",
            (session_id, sender, message)
        )
        row = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'id': row[0], 'created_at': row[1].isoformat()})
        }

    return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'method not allowed'})}