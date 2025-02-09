"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAccount } from "wagmi";
import { z } from "zod";
import OCButton from "~~/components/Button";
import { NGROK_BASE_URL } from "~~/services/api";

const schema = z.object({
  name: z.string().min(1, {
    message: "Name is required.",
  }),
  description: z.string().min(1, {
    message: "Name is required.",
  }),
  apiUrl: z.string().url({
    message: "Invalid URL.",
  }),
  costPerOutputToken: z.string().min(1, {
    message: "Cost must be a positive number.",
  }),
  pfpURL: z.string().url({
    message: "Invalid URL.",
  }),
});

type FormData = z.infer<typeof schema>;

const RegisterAgent = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const [loading, setLoading] = useState(false);
  const { address } = useAccount();
  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const payload = {
        agentDescription: data.description,
        agentName: data.name,
        agentImage: data.pfpURL,
        apiUrl: data.apiUrl,
        costPerOutputToken: parseFloat(data.costPerOutputToken),
        userAddress: address,
      };
      await fetch(`${NGROK_BASE_URL}/agents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      alert("Agent registered successfully!");
      router.push("/agent-dashboard");
      // TODO -> REDIRECT TO ALL AGENTS PAGE
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inputClassName =
    "w-full px-6 py-2 bg-gray-800/70 border border-gray-700/50 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition duration-300 ease-in-out";
  return (
    <div className="w-full h-full flex justify-between items-center">
      {!loading ? (
        <form onSubmit={handleSubmit(onSubmit)} className="flex justify-center items-center w-3/4 h-full">
          <div className="flex flex-col gap-y-4 w-1/2">
            <div>
              <label>Name</label>
              <input {...register("name")} className={inputClassName} />
              {errors.name && <p>{errors.name.message}</p>}
            </div>
            <div>
              <label>Description</label>
              <input {...register("description")} className={inputClassName} />
            </div>
            <div>
              <label>API URL</label>
              <input {...register("apiUrl")} className={inputClassName} />
              {errors.apiUrl && <p>{errors.apiUrl.message}</p>}
            </div>
            <div>
              <label>Cost Per Output Token</label>
              <input type="test" {...register("costPerOutputToken")} className={inputClassName} />
              {errors.costPerOutputToken && <p>{errors.costPerOutputToken.message}</p>}
            </div>
            <div>
              <label>Profile URL</label>
              <input type="text" {...register("pfpURL")} className={inputClassName} />
              {errors.pfpURL && <p>{errors.pfpURL.message}</p>}
            </div>
            <div className="w-full flex justify-center items-center">
              <div className="w-1/2 flex justify-center items-center">
                <OCButton type="submit" style={{ margin: "20px 0" }}>
                  Register Agent
                </OCButton>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="w-full h-full flex justify-center items-center">
          <div className="flex w-3/4 flex-col gap-4 my-4">
            <div className="skeleton h-32 w-full"></div>
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-full"></div>
          </div>
        </div>
      )}
      <div className="w-1/2 flex flex-col justify-center items-center">
        <div>
          <Image
            src="/logo.gif"
            alt="ORCHSTR.AI Assistant"
            className="object-cover rounded-full"
            width={350}
            height={350}
          />
        </div>
        <div className="text-5xl font-extrabold h-16">Register Agent</div>
        <div className="text-center text-lg text-gray-600 text-center max-w-2xl mx-auto mb-8 mr-5">
          Register as an agent to start earning money by providing your services to the community.
        </div>
      </div>
    </div>
  );
};

export default RegisterAgent;
