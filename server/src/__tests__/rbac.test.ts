import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../index";
import { createTestCollege, createTestUser, loginAs } from "./helpers";

describe("Role-Based Access Control and Tenant Isolation", () => {
  let collegeId: string;
  let studentCookie: string;
  let officerCookie: string;

  beforeAll(async () => {
    const college = await createTestCollege("RBAC001");
    collegeId = college.id;

    const student = await createTestUser(`student_rbac_${Date.now()}@test.com`, "STUDENT", collegeId);
    const officer = await createTestUser(`officer_rbac_${Date.now()}@test.com`, "PLACEMENT_OFFICER", collegeId);

    studentCookie = await loginAs(student.email);
    officerCookie = await loginAs(officer.email);
  });

  it("should prevent STUDENT from accessing admin overview (403)", async () => {
    const res = await request(app)
      .get("/api/admin/overview")
      .set("Cookie", [studentCookie]);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("should prevent STUDENT from creating placement drives (403)", async () => {
    const res = await request(app)
      .post("/api/drives")
      .set("Cookie", [studentCookie])
      .send({
        companyId: "some-comp",
        title: "Unauthorized Drive",
        jobType: "FULL_TIME",
        applicationOpenDate: new Date(),
        applicationCloseDate: new Date(Date.now() + 86400000),
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("should allow PLACEMENT_OFFICER to access admin overview (200)", async () => {
    const res = await request(app)
      .get("/api/admin/overview")
      .set("Cookie", [officerCookie]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.overview).toBeDefined();
  });

  it("should prevent unauthenticated access to protected routes (401)", async () => {
    const res = await request(app).get("/api/students/me");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
