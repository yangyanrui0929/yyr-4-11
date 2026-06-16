import { useState } from "react";
import { useGameStore, getTowerStats } from "@/store/useGameStore";
import { TOWER_CONFIGS, BRANCH_CONFIGS } from "@/game/config";
import Card from "@/components/common/Card";
import { ArrowUp, Trash2, X } from "lucide-react";
import type { TowerBranch } from "@/types/game";

export default function TowerInfo() {
  const { selectedTowerId, towers, gold, upgradeTower, sellTower, selectTower, selectBranch } =
    useGameStore();

  const [showBranchDialog, setShowBranchDialog] = useState(false);

  const tower = towers.find((t) => t.id === selectedTowerId);

  if (!tower) {
    return (
      <Card title="塔信息" icon="ℹ️" className="h-full">
        <div className="text-center text-gray-500 py-8">
          <div className="text-4xl mb-2">🔍</div>
          <div>点击已放置的塔查看详情</div>
        </div>
      </Card>
    );
  }

  const config = TOWER_CONFIGS[tower.type];
  const stats = getTowerStats(tower);

  let totalCost = config.cost;
  for (let l = 1; l < tower.level; l++) {
    totalCost += Math.floor(
      config.upgradeCost * Math.pow(config.upgradeMultiplier, l - 1)
    );
  }
  const refund = Math.floor(totalCost * 0.6);

  const canUpgrade = tower.level < 5 && gold >= stats.upgradeCost;
  const needsBranch = tower.level >= 3 && !tower.branch;

  const nextStats =
    tower.level < 5
      ? getTowerStats({ type: tower.type, level: tower.level + 1, branch: tower.branch })
      : null;

  const branchOptions = BRANCH_CONFIGS[tower.type];

  const handleUpgrade = () => {
    if (needsBranch) {
      setShowBranchDialog(true);
      return;
    }
    upgradeTower(tower.id);
  };

  const handleBranchSelect = (branch: TowerBranch) => {
    selectBranch(tower.id, branch);
    setShowBranchDialog(false);
  };

  if (showBranchDialog) {
    return (
      <Card title="选择分支" icon="🔀" className="h-full">
        <div className="flex justify-end">
          <button
            onClick={() => setShowBranchDialog(false)}
            className="p-1 rounded hover:bg-gray-100"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="mb-3 text-center">
          <span className="text-3xl">{config.emoji}</span>
          <div className="font-bold text-kitchen-brown mt-1">{config.name} Lv.3</div>
          <div className="text-xs text-gray-500 mt-1">选择一个分支，选定后不可更改</div>
        </div>

        <div className="space-y-3">
          {branchOptions.map((b) => {
            const previewStats = getTowerStats({
              type: tower.type,
              level: tower.level,
              branch: b.id,
            });
            return (
              <button
                key={b.id}
                onClick={() => handleBranchSelect(b.id)}
                className="w-full p-3 rounded-lg border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 hover:border-orange-400 hover:shadow-md transition-all text-left"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{b.emoji}</span>
                  <span className="font-bold text-kitchen-brown">{b.name}</span>
                </div>
                <div className="text-xs text-gray-600 mb-2">{b.description}</div>
                <div className="grid grid-cols-3 gap-1 text-xs">
                  <div className="text-center p-1 bg-white/60 rounded">
                    <div className="text-gray-500">伤害</div>
                    <div className="font-bold text-red-600">{previewStats.damage}</div>
                  </div>
                  <div className="text-center p-1 bg-white/60 rounded">
                    <div className="text-gray-500">射程</div>
                    <div className="font-bold text-blue-600">{previewStats.range}</div>
                  </div>
                  <div className="text-center p-1 bg-white/60 rounded">
                    <div className="text-gray-500">攻速</div>
                    <div className="font-bold text-purple-600">
                      {(1000 / previewStats.fireRate).toFixed(1)}/秒
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Card>
    );
  }

  const branchConfig = tower.branch
    ? BRANCH_CONFIGS[tower.type].find((b) => b.id === tower.branch)
    : null;

  return (
    <Card title="塔信息" icon="ℹ️" className="h-full">
      <div className="flex justify-end">
        <button
          onClick={() => selectTower(null)}
          className="p-1 rounded hover:bg-gray-100"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="flex items-center gap-3 mb-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg">
        <span className="text-4xl">{config.emoji}</span>
        <div>
          <div className="font-bold text-lg text-kitchen-brown">
            {config.name}
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`text-lg ${
                  i < tower.level ? "text-yellow-400" : "text-gray-300"
                }`}
              >
                ★
              </span>
            ))}
          </div>
        </div>
      </div>

      {branchConfig && (
        <div className="mb-3 p-2 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2">
            <span className="text-lg">{branchConfig.emoji}</span>
            <span className="font-bold text-purple-700 text-sm">{branchConfig.name}</span>
          </div>
          <div className="text-xs text-purple-600 mt-0.5">{branchConfig.description}</div>
        </div>
      )}

      <div className="space-y-2 text-sm mb-3">
        <div className="flex justify-between">
          <span className="text-gray-600">💥 伤害</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-red-600">{stats.damage}</span>
            {nextStats && nextStats.damage !== stats.damage && (
              <span className="text-xs text-green-600">
                → {nextStats.damage}
              </span>
            )}
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">📏 射程</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-blue-600">{stats.range}</span>
            {nextStats && nextStats.range !== stats.range && (
              <span className="text-xs text-green-600">
                → {nextStats.range}
              </span>
            )}
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">⚡ 攻速</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-purple-600">
              {(1000 / stats.fireRate).toFixed(1)}/秒
            </span>
            {nextStats && nextStats.fireRate !== stats.fireRate && (
              <span className="text-xs text-green-600">
                → {(1000 / nextStats.fireRate).toFixed(1)}/秒
              </span>
            )}
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">✨ 特效</span>
          <span className="font-medium text-kitchen-warm text-xs">
            {branchConfig
              ? `${branchConfig.emoji} ${branchConfig.name}：${branchConfig.description}`
              : config.special}
          </span>
        </div>
      </div>

      {nextStats && !needsBranch && (
        <div className="mb-3 p-2 bg-green-50 rounded-lg border border-green-200">
          <div className="text-xs font-bold text-green-700 mb-1">📊 升级预览 (Lv.{tower.level} → Lv.{tower.level + 1})</div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">伤害</span>
              <span className={nextStats.damage > stats.damage ? "text-green-600 font-bold" : "text-gray-500"}>
                {stats.damage} → {nextStats.damage}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">射程</span>
              <span className={nextStats.range > stats.range ? "text-green-600 font-bold" : "text-gray-500"}>
                {stats.range} → {nextStats.range}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">攻速</span>
              <span className={nextStats.fireRate < stats.fireRate ? "text-green-600 font-bold" : "text-gray-500"}>
                {(1000 / stats.fireRate).toFixed(1)} → {(1000 / nextStats.fireRate).toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">费用</span>
              <span className="text-amber-600 font-bold">💰 {stats.upgradeCost}</span>
            </div>
          </div>
        </div>
      )}

      {needsBranch && (
        <div className="mb-3 p-2 bg-amber-50 rounded-lg border border-amber-300">
          <div className="text-xs font-bold text-amber-700 mb-1">⚠️ 分支选择</div>
          <div className="text-xs text-amber-600">塔已达到3级，请先选择分支才能继续升级</div>
        </div>
      )}

      <div className="space-y-2">
        <button
          onClick={handleUpgrade}
          disabled={tower.level >= 5 || (gold < stats.upgradeCost && !needsBranch)}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${
            tower.level >= 5
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : needsBranch
              ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow hover:shadow-lg hover:-translate-y-0.5"
              : canUpgrade
              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow hover:shadow-lg hover:-translate-y-0.5"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <ArrowUp className="w-5 h-5" />
          {tower.level >= 5 ? (
            "已满级"
          ) : needsBranch ? (
            <>
              选择分支 🔀
            </>
          ) : (
            <>
              升级 Lv.{tower.level + 1} 💰 {stats.upgradeCost}
            </>
          )}
        </button>

        <button
          onClick={() => {
            if (confirm(`确定拆除 ${config.name}？将返还 💰${refund}`)) {
              sellTower(tower.id);
            }
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium bg-red-100 text-red-600 hover:bg-red-200 transition-all"
        >
          <Trash2 className="w-4 h-4" />
          拆除 (返还 💰{refund})
        </button>
      </div>
    </Card>
  );
}
