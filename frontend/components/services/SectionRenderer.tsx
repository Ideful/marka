"use client";

import type { MainService, Section } from "@/lib/api/services";
import type { TableTemplate } from "@/lib/table-templates";
import { RankGenderMatrixView } from "@/components/services/templates/RankGenderMatrixView";
import { RankVariantMatrixView } from "@/components/services/templates/RankVariantMatrixView";
import { ServiceLengthMatrixView } from "@/components/services/templates/ServiceLengthMatrixView";
import { ServiceRankMatrixGroupedView } from "@/components/services/templates/ServiceRankMatrixGroupedView";
import { ServiceSinglePriceBySpecialistView } from "@/components/services/templates/ServiceSinglePriceBySpecialistView";
import { ServiceSingleRankMatrixView } from "@/components/services/templates/ServiceSingleRankMatrixView";

type Props = {
  main: MainService;
  section: Section;
};

export function SectionRenderer({ main, section }: Props) {
  const template = (section.table_template ?? "") as TableTemplate;

  switch (template) {
    case "rank_gender_matrix":
      return <RankGenderMatrixView main={main} section={section} />;
    case "rank_variant_matrix":
      return <RankVariantMatrixView main={main} section={section} />;
    case "service_length_matrix":
      return <ServiceLengthMatrixView main={main} section={section} />;
    case "service_single_price_by_specialist":
      return <ServiceSinglePriceBySpecialistView main={main} section={section} />;
    case "service_rank_matrix_grouped":
      return <ServiceRankMatrixGroupedView main={main} section={section} />;
    case "service_single_rank_matrix":
      return <ServiceSingleRankMatrixView main={main} section={section} />;
    default:
      return (
        <ServiceSinglePriceBySpecialistView main={main} section={section} />
      );
  }
}
