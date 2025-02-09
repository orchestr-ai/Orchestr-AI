import Image from "next/image";
import OCButton from "./Button";
import { IPlan } from "~~/type";

interface IPlansRender {
  plans: IPlan[];
  onReject: () => void;
  onAccept: () => void;
}

const Plans = ({ plans, onAccept, onReject }: IPlansRender) => {
  const totalAmount = plans.reduce((acc, plan) => acc + plan.agentPrice, 0);
  return (
    <div className="my-6 space-y-4 bg-purple-600/10 rounded-2xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-4">Agent Quote</h2>
      <div className="space-y-3">
        {plans.map((plan, index) => (
          <div key={index} className="bg-[rgba(255,255,255,0.18)] rounded-xl shadow-sm px-3 py-1">
            <div className="flex flex-col gap-y-2">
              <div className="flex items-center space-x-4">
                <Image
                  src="https://img.freepik.com/premium-photo/friendly-looking-ai-agent-as-logo-white-background-style-raw-job-id-ef2c5ef7e19b4dadbef969fcb37e_343960-69677.jpg"
                  alt="agent"
                  width={30}
                  height={30}
                  className="rounded-full"
                />
                <p className="text-bold">{plan.agentName}</p>
              </div>
              <div className="flex items-center justify-between text-sm text-white-300 gap-x-16">
                <p className="text-bold">{plan.agentAddress.slice(0, 18)}...</p>
                <p className="text-bold font-medium text-white-300">{plan.agentPrice} ETH</p>
              </div>
            </div>
          </div>
        ))}
        <div className="flex flex-row justify-between items-center bg-purple-100 rounded-xl shadow-sm px-3 py-1">
          <p className="text-lg text-gray-600 text-bold">Total</p>
          <p className="font-bold text-lg text-gray-800">{totalAmount.toFixed(3)} ETH</p>
        </div>
      </div>
      <div className="w-full flex justify-between items-center gap-x-6">
        <OCButton style={{ padding: "6px 0px" }} onClick={onReject}>
          Reject
        </OCButton>
        <OCButton style={{ padding: "6px 0px" }} onClick={onAccept}>
          Confirm
        </OCButton>
      </div>
    </div>
  );
};

export default Plans;
