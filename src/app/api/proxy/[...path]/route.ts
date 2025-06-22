import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://137.184.32.159:3000';

export async function GET(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  return handleProxyRequest(request, context.params.path, 'GET');
}

export async function POST(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  return handleProxyRequest(request, context.params.path, 'POST');
}

export async function PUT(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  return handleProxyRequest(request, context.params.path, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  return handleProxyRequest(request, context.params.path, 'DELETE');
}

export async function PATCH(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  return handleProxyRequest(request, context.params.path, 'PATCH');
}

async function handleProxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    // Construct the target URL
    const path = pathSegments.join('/');
    const targetUrl = `${BACKEND_URL}/${path}`;
    
    // Get the search params from the original request
    const searchParams = request.nextUrl.searchParams.toString();
    const fullUrl = searchParams ? `${targetUrl}?${searchParams}` : targetUrl;

    // Prepare headers
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      // Skip some headers that shouldn't be forwarded
      if (!['host', 'origin', 'referer'].includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    });

    // Get the request body if it exists
    let body: string | undefined;
    if (method !== 'GET' && method !== 'HEAD') {
      try {
        body = await request.text();
      } catch {
        // No body to read
      }
    }

    // Make the request to the backend
    const response = await fetch(fullUrl, {
      method,
      headers,
      body,
    });

    // Get the response body
    const responseBody = await response.text();

    // Create a new response with the same status and headers
    const proxyResponse = new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
    });

    // Copy response headers
    response.headers.forEach((value, key) => {
      proxyResponse.headers.set(key, value);
    });

    return proxyResponse;
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to backend' },
      { status: 500 }
    );
  }
} 