import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import "./App.css";

/* ---------------- UI COMPONENTS (SHADCN STYLE REPLACEMENT) ---------------- */

const Card = ({ children }) => (
  <div className="card">{children}</div>
);

const CardContent = ({ children }) => <div>{children}</div>;

const Button = ({ children, className = "", ...props }) => (
  <button {...props} className={`btn ${className}`}>
    {children}
  </button>
);

const Input = (props) => (
  <input {...props} className="input" />
);

/* ---------------- MAIN APP ---------------- */

export default function App() {
  const [cart, setCart] = useState([]);

  const [repairAmount, setRepairAmount] = useState({ body: "", engine: "" });
  const [cleaningAmount, setCleaningAmount] = useState("");
  const [paintAmount, setPaintAmount] = useState("");
  const [cosmeticAmount, setCosmeticAmount] = useState("");
  const [jobLogs, setJobLogs] = useState([]);
  const [discountLevel, setDiscountLevel] = useState(0);

  const completeJob = () => {
    setJobLogs(prev => [
      {
        id: Date.now(),
        items: cart,
        total,
        commission,
        time: new Date().toLocaleString(),
      },
      ...prev
    ]);

    setCart([]);
  };

  const defaultLegal = {
    engineTier: 3,
    brakesTier: 3,
    transmissionTier: 2,
    suspensionTier: 4,
    turbo: true,
    armor: true,
    remove: {
      engine: false,
      brakes: false,
      transmission: false,
      suspension: false,
      turbo: false,
      armor: false,
    },
  };

  const defaultIllegal = {
    engineTier: 4,
    brakesTier: 3,
    transmissionTier: 3,
    suspensionTier: 4,
    turbo: true,
    armor: true,
    remove: {
      engine: false,
      brakes: false,
      transmission: false,
      suspension: false,
      turbo: false,
      armor: false,
    },
  };

const emptyBuilder = {
  engineTier: 0,
  brakesTier: 0,
  transmissionTier: 0,
  suspensionTier: 0,
  turbo: false,
  armor: false,
  remove: {
    engine: false,
    brakes: false,
    transmission: false,
    suspension: false,
    turbo: false,
    armor: false,
  },
};

const setEmpty = () => setBuilder(emptyBuilder);

  const [builder, setBuilder] = useState(emptyBuilder);

  /* ---------------- PRICES ---------------- */

  const prices = {
    repairs: { engine: 40, body: 40 },

    engine: [0, 2600, 3000, 4200, 9000, 9500],
    brakes: [0, 2000, 2600, 3500],
    transmission: [0, 2800, 3200, 4500, 5200],
    suspension: [0, 2400, 2800, 3500, 4000, 4200],

    turbo: 2000,
    armor: 4500,

    removal: {
      engine: 800,
      brakes: 600,
      transmission: 1000,
      suspension: 500,
      misc: 500,
    },

    misc: {
      driftTires: 300,
      tireSmoke: 100,
      livery: 200,
      paint: 150,
      tint: 120,
      turbo: 2000,
      armor: 4500,
      underglow: 200,
      nosRefill: 600,
      nosBottle: 2000,
    },

    cosmetic: 100,
    cleaningKit: 100,
  };

  /* ---------------- PRICE CALC ---------------- */

  function getItemPrice(item) {
    if (item.type === "repair")
      return prices.repairs[item.sub] * (item.amount || 1);

    if (item.type === "cosmetic")
      return prices.cosmetic * (item.amount || 1);

    if (item.type === "cleaning")
      return prices.cleaningKit * (item.amount || 1);

    if (["engine", "brakes", "transmission", "suspension"].includes(item.type)) {
      return prices[item.type][item.tier];
    }

    if (item.type === "turbo" || item.type === "armor")
      return prices[item.type];

    if (item.type === "nos") return prices.nos[item.sub];
    if (item.type === "remove") return prices.removal[item.sub];
    if (item.type === "misc") {
      if (item.sub === "paint") {
        return prices.misc.paint * (item.amount || 1);
      }
      return prices.misc[item.sub];
    }

    if (item.type === "package") return item.total;

    return 0;
  }

  /* ---------------- BUILDER TOTAL ---------------- */

  const builderTotal = useMemo(() => {
    let total = 0;

    const add = (type, tier) => prices[type]?.[tier] || 0;

    if (!builder.remove.engine) total += add("engine", builder.engineTier);
    if (!builder.remove.brakes) total += add("brakes", builder.brakesTier);
    if (!builder.remove.transmission)
      total += add("transmission", builder.transmissionTier);
    if (!builder.remove.suspension)
      total += add("suspension", builder.suspensionTier);

    if (builder.turbo && !builder.remove.turbo) total += prices.turbo;
    if (builder.armor && !builder.remove.armor) total += prices.armor;

    // ✅ Apply discount HERE
    if (discountLevel > 0) {
      total *= (1 - discountLevel / 100);
    }

    return total;
  }, [builder, discountLevel]);

  /* ---------------- CART TOTAL ---------------- */

  const total = useMemo(
    () => cart.reduce((s, i) => s + getItemPrice(i), 0),
    [cart]
  );

  const addToCart = (item) => setCart([...cart, item]);
  const removeFromCart = (i) =>
    setCart(cart.filter((_, idx) => idx !== i));

  const setLegal = () => setBuilder(defaultLegal);
  const setIllegal = () => setBuilder(defaultIllegal);

  const addBuilderToCart = () => {
    addToCart({
      type: "package",
      name: builder.engineTier === 4 ? "Illegal Upgrade" : "Legal Upgrade",
      total: builderTotal,
    });
    setBuilder(emptyBuilder);
    setDiscountLevel(0);
  };

  const commissionRate = 0.35;

  const commission = useMemo(
    () => total * commissionRate,
    [total]
  );

    /* ---------------- LOAD + SAVE JOB LOGS ---------------- */

  useEffect(() => {
    const loadLogs = async () => {
      const logs = await window.api.getJobLogs();
      setJobLogs(logs);
    };

    loadLogs();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      window.api.saveJobLogs(jobLogs);
    }, 300);

    return () => clearTimeout(timeout);
  }, [jobLogs]);

  /* ---------------- UI ---------------- */

  return (
    <div className="app">
      <h1 className="title">
        East Customs Pricing
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT SIDE */}
      
          {/* BUILDER */}
          <Card>
            <CardContent className="space-y-2">
              <h2 className="subtitle">Upgrade Builder</h2>

              <div className="flex flex-wrap gap-3">
                <Button onClick={setLegal}>Legal</Button>
                <Button onClick={setIllegal}>Illegal</Button>
                <Button onClick={setEmpty}>Empty</Button>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold">Employee Discount</label>

                <label>
                  <input
                    type="radio"
                    name="discount"
                    checked={discountLevel === 0}
                    onChange={() => setDiscountLevel(0)}
                  />
                  No Discount
                </label>

                <label>
                  <input
                    type="radio"
                    name="discount"
                    checked={discountLevel === 25}
                    onChange={() => setDiscountLevel(25)}
                  />
                  25% Employee
                </label>

                <label>
                  <input
                    type="radio"
                    name="discount"
                    checked={discountLevel === 30}
                    onChange={() => setDiscountLevel(30)}
                  />
                  30% Senior Employee
                </label>
              </div>

              {[
                ["engineTier", "Engine", 5],
                ["brakesTier", "Brakes", 3],
                ["transmissionTier", "Transmission", 4],
                ["suspensionTier", "Suspension", 5],
              ].map(([key, label, max]) => (
                <div key={key} className="flex justify-between items-center">
                  <span>{label}</span>

                  <select
                    value={builder[key]}
                    onChange={(e) =>
                      setBuilder({
                        ...builder,
                        [key]: Number(e.target.value),
                      })
                    }
                    className="select"
                  >
                    {Array.from({ length: max + 1 }, (_, i) => i).map(
                      (t) => (
                        <option key={t} value={t}>
                          Tier {t}
                        </option>
                      )
                    )}
                  </select>
                </div>
              ))}

              <div className="text-lg font-bold text-purple-700">
                Total: ${builderTotal}
              </div>

              <Button onClick={addBuilderToCart}>
                Add Package
              </Button>
            </CardContent>
          </Card>

          {/* REPAIRS */}
          <Card>
            <CardContent className="space-y-2">
              <h2 className="subtitle">Repairs</h2>

              {Object.keys(repairAmount).map((type) => (
                <div key={type} className="flex gap-2 items-center">
                  <span className="w-20">{type}</span>
                  <Input
                    type="number"
                    value={repairAmount[type] ?? ""}
                    onChange={(e) =>
                      setRepairAmount({
                        ...repairAmount,
                        [type]: (e.target.value),
                      })
                    }
                  />
                  <Button
                    onClick={() => {
                      addToCart({
                        type: "repair",
                        sub: type,
                        amount: Number(repairAmount[type] || ""),
                      });

                      setRepairAmount({
                        ...repairAmount,
                        [type]: "",
                      });
                    }}
                  >
                    Add
                </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* MISC */}
          <Card>
            <CardContent className="space-y-2">
              <h2 className="subtitle">Misc</h2>

              <div className="flex gap-2 items-center">
                <span className="w-20">Cleaning Kit</span>
                <Input
                  type="number"
                  value={cleaningAmount ?? ""}
                  onChange={(e) =>
                    setCleaningAmount(e.target.value)
                  }
                />
                <Button
                  onClick={() => {
                    addToCart({
                      type: "cleaning",
                      amount: Number(cleaningAmount || ""),
                    });

                    setCleaningAmount("");
                  }}
                >
                  Cleaning Kit
                </Button>
              </div>

              <div className="flex gap-2 items-center">
                <span className="w-20">Cosmetic</span>
                <Input
                  type="number"
                  value={cosmeticAmount ?? ""}
                  onChange={(e) =>
                    setCosmeticAmount(e.target.value)
                  }
                />
                <Button
                  onClick={() => {
                  addToCart({
                    type: "cosmetic",
                    amount: Number(cosmeticAmount || ""),
                  });

                  setCosmeticAmount("");
                }}
                >
                  Add Cosmetic
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2 items-center">
                  <span className="w-20">Paint</span>
                  <Input
                    type="number"
                    value={paintAmount ?? ""}
                    onChange={(e) =>
                      setPaintAmount(e.target.value)
                    }
                  />
                  <Button
                    onClick={() => {
                      addToCart({
                        type: "misc",
                        sub: "paint",
                        amount: Number(paintAmount || ""),
                      });

                      setPaintAmount("");
                      
                    }}
                  >
                    Add Paint
                  </Button>
                </div>

                <div className="flex gap-2 items-center">
                  {Object.keys(prices.misc)
                    .filter((i) => i !== "paint")
                    .map((item) => (
                      <Button
                        key={item}
                        onClick={() =>
                          addToCart({ type: "misc", sub: item })
                        }
                      >
                        {item}
                      </Button>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-8">
              <h2 className="subtitle">Remove Upgrades</h2>

              {[
                ["engine", "Engine"],
                ["brakes", "Brakes"],
                ["transmission", "Transmission"],
                ["suspension", "Suspension"],
                ["misc", "Misc"],
              ].map(([key, label]) => (
                <div key={key} className="flex justify-between items-center">
                  <span>{label}</span>

                  <Button
                    onClick={() =>
                      addToCart({
                        type: "remove",
                        sub: key,
                        name: `Remove ${label}`,
                      })
                    }
                  >
                    Remove (${prices.removal[key]})
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        

        {/* CART */}
        <Card>
          <CardContent>
            <h2 className="subtitle">Cart</h2>

            <div className="space-y-2">
              {cart.map((item, i) => (
                <div
                  key={i}
                  className="cart-item"
                >
                  <span>
                    {item.name ||
                      (item.type === "remove"
                        ? `Remove ${item.sub}`
                        : `${item.type} ${item.sub}${item.amount ? ` x${item.amount}` : ""}`)}
                  </span>

                  <div className="flex gap-2 items-center">
                    <span>${getItemPrice(item)}</span>
                    <button
                      onClick={() => removeFromCart(i)}
                      className="delete-btn"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-xl font-bold text-purple-700">
              <div>Total: ${total}</div>
              <div className="text-green-600">
                Commission (35%): ${commission.toFixed(0)}
              </div>
            </div>
            <Button
              onClick={() => {
                completeJob();
                setBuilder(emptyBuilder);
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Complete Job
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex justify-between items-center mb-2">
              <h2 className="subtitle">Job History</h2>

              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={() => {
                  const confirmDelete = window.confirm(
                    "Are you sure you want to delete ALL job logs?"
                  );

                  if (confirmDelete) {
                    setJobLogs([]);
                  }
                }}
              >
                Clear Logs
              </Button>
            </div>

            <div className="space-y-2">
              {jobLogs.length === 0 && (
                <p className="text-gray-400">No completed jobs yet.</p>
              )}

              {jobLogs.map((log) => (
                <div
                  key={log.id}
                  className="cart-item flex flex-col items-start"
                >
                  <div className="flex justify-between w-full">
                    <span className="font-semibold">
                      Job #{log.id}
                    </span>
                    <span className="text-sm text-gray-400">
                      {log.time}
                    </span>
                  </div>

                  <div className="mt-1">
                    <div>Total: ${log.total}</div>
                    <div className="text-green-500">
                      Commission: ${log.commission.toFixed(0)}
                    </div>
                    <div className="text-sm text-gray-400">
                      Items: {log.items.length}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}