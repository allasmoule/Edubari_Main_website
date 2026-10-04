"use client";

import React from "react";
import { useParams } from "next/navigation";
import FeatureDetailView from "@/components/Feature/FeatureDetailView";

export default function DynamicFeatureDetailPage() {
  const params = useParams();
  const slug = params?.slug;

  return <FeatureDetailView slug={slug} />;
}
