import { NextResponse } from "next/server";
import { storageService } from "@/services/storageService";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const name = searchParams.get("name") || searchParams.get("id");

    if (type === "dependencies" && name) {
      const deps = await storageService.checkClassDependencies(name);
      return NextResponse.json({ success: true, data: deps });
    }

    if (type === "section_dependencies" && name) {
      const section = searchParams.get("section") || "";
      const deps = await storageService.checkSectionDependencies(name, section);
      return NextResponse.json({ success: true, data: deps });
    }

    const classes = await storageService.getClasses();
    return NextResponse.json({ success: true, data: classes });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ success: false, error: "Class name is required" }, { status: 400 });
    }

    const created = await storageService.createClass(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err) {
    const isAlreadyExists = err.message?.includes("already exists");
    return NextResponse.json(
      {
        success: false,
        alreadyExists: isAlreadyExists,
        error: err.message,
      },
      { status: isAlreadyExists ? 409 : 400 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const target = body.id || body.name || body.className;
    if (!target) {
      return NextResponse.json({ success: false, error: "Class name or ID is required" }, { status: 400 });
    }
    if (!body.sections || (Array.isArray(body.sections) && body.sections.length === 0)) {
      return NextResponse.json({ success: false, error: "At least one section is required" }, { status: 400 });
    }

    const updated = await storageService.updateClassSections(target, body.sections);
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");
    let name = searchParams.get("name");
    let force = searchParams.get("force") === "true";

    try {
      const body = await request.json();
      if (body) {
        if (body.id) id = body.id;
        if (body.name) name = body.name;
        if (body.force !== undefined) force = Boolean(body.force);
      }
    } catch {}

    const target = id || name;
    if (!target) {
      return NextResponse.json({ success: false, error: "Class ID or name is required" }, { status: 400 });
    }

    try {
      const result = await storageService.deleteClass(target, force);
      return NextResponse.json({ success: true, data: result });
    } catch (err) {
      if (err.message?.includes("Confirmation required")) {
        const deps = await storageService.checkClassDependencies(target);
        return NextResponse.json(
          {
            success: false,
            requiresConfirmation: true,
            dependencies: deps,
            error: err.message,
          },
          { status: 409 }
        );
      }
      throw err;
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
