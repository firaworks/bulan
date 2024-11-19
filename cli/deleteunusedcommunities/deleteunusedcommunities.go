package deleteunusedcommunities

import (
	"database/sql"
	"log"
	"slices"
	"strings"

	"github.com/discuitnet/discuit/core"
	"github.com/urfave/cli/v2"
)

const defaultDays = "30"

var Command = &cli.Command{
	Name:  "delete-unused-communities",
	Usage: "Delete all communities with 0 posts older than (by default) " + defaultDays + " days",
	Flags: []cli.Flag{
		&cli.IntFlag{
			Name:        "days",
			Usage:       "Only deletes communities older than this many days",
			DefaultText: defaultDays,
		},
	},
	Action: func(ctx *cli.Context) error {
		db := ctx.Context.Value("db").(*sql.DB)
		days := uint(ctx.Int("days"))

		log.Println("Deleting unused communities...")

		names, err := core.DeleteUnusedCommunities(ctx.Context, db, days)
		if err != nil {
			log.Printf("Failed to delete unused communities older than %d days: %v", days, err)
			return err
		}
		slices.Sort(names)

		if len(names) == 0 {
			log.Println("There are no unused communities to delete.")
		} else {
			var b strings.Builder
			for i, name := range names {
				if i != 0 {
					b.WriteString(", ")
				}
				b.WriteString(name)
			}
			b.WriteString(".")
			log.Printf("Successfully deleted %d unused communities with 0 posts in them: %s", len(names), b.String())
		}

		return nil
	},
}
