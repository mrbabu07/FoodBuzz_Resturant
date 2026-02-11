const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    planType: {
      type: String,
      enum: ["weekly_lunch", "monthly_meal", "custom"],
      required: true,
    },
    planName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    menuItems: [
      {
        menuItemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItem",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        dayOfWeek: {
          type: Number, // 0=Sunday, 1=Monday, etc.
          min: 0,
          max: 6,
        },
      },
    ],
    deliverySchedule: {
      frequency: {
        type: String,
        enum: ["daily", "weekly", "biweekly", "monthly"],
        required: true,
      },
      deliveryDays: [
        {
          type: Number, // 0=Sunday, 1=Monday, etc.
          min: 0,
          max: 6,
        },
      ],
      deliveryTime: {
        type: String, // e.g., "12:00"
        default: "12:00",
      },
    },
    deliveryAddress: {
      type: String,
      required: true,
    },
    pricing: {
      basePrice: {
        type: Number,
        required: true,
      },
      discount: {
        type: Number,
        default: 0,
      },
      finalPrice: {
        type: Number,
        required: true,
      },
    },
    status: {
      type: String,
      enum: ["active", "paused", "cancelled", "expired"],
      default: "active",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    nextDeliveryDate: {
      type: Date,
    },
    pausedUntil: {
      type: Date,
    },
    totalDeliveries: {
      type: Number,
      default: 0,
    },
    completedDeliveries: {
      type: Number,
      default: 0,
    },
    skippedDeliveries: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["card", "cash", "wallet"],
      default: "card",
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true },
);

// Index for efficient queries
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ nextDeliveryDate: 1, status: 1 });

// Method to calculate next delivery date
subscriptionSchema.methods.calculateNextDelivery = function () {
  const now = new Date();
  const schedule = this.deliverySchedule;

  if (schedule.frequency === "daily") {
    const next = new Date(now);
    next.setDate(next.getDate() + 1);
    return next;
  } else if (schedule.frequency === "weekly") {
    const next = new Date(now);
    next.setDate(next.getDate() + 7);
    return next;
  } else if (schedule.frequency === "biweekly") {
    const next = new Date(now);
    next.setDate(next.getDate() + 14);
    return next;
  } else if (schedule.frequency === "monthly") {
    const next = new Date(now);
    next.setMonth(next.getMonth() + 1);
    return next;
  }

  return null;
};

// Method to pause subscription
subscriptionSchema.methods.pause = function (until) {
  this.status = "paused";
  this.pausedUntil = until;
};

// Method to resume subscription
subscriptionSchema.methods.resume = function () {
  this.status = "active";
  this.pausedUntil = null;
  this.nextDeliveryDate = this.calculateNextDelivery();
};

module.exports = mongoose.model("Subscription", subscriptionSchema);
