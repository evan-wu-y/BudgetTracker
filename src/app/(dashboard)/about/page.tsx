"use client";

import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

function AboutPage() {
  const [name, setName] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["about", name],
    queryFn: async () => {
      console.log(1111);
      //   const res = await fetch("/api/about");
      //   return res.json();
      const res = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({ name });
        }, 1000);
      });
      return res;
    },
    retry: false,
  });
  useEffect(() => {
    console.log(data);
  }, [data]);
  return (
    <div className="container">
      <Input value={name} onChange={(e) => setName(e.target.value)} />
      {JSON.stringify(data, null, 2)}
    </div>
  );
}

export default AboutPage;
