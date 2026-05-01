export const runtime = "edge";

export async function GET() {
    return new Response("HELLO! API IS WORKING", { status: 200 });
}

export const POST = GET;
